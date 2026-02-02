# students/serializers.py
"""
Professional DRF Serializers for Student Functionality
Built for EduVibe - Educational Platform
Version: 2.0 (2026)
"""

from rest_framework import serializers
from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
from .models import StudentAnswer, TestAttempt
from teachers.models import Test, Question, Assignment, Doubt, Attendance
from admin_tasks.models import Chapter, Subject, FeePayment, Notification


# ═══════════════════════════════════════════════════════════
#  Student Test Taking Serializers
# ═══════════════════════════════════════════════════════════

class StudentQuestionSerializer(serializers.ModelSerializer):
    """
    Question serializer for students (hides correct answers).
    """
    question_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = [
            'id', 'question_text', 'question_image', 'question_image_url',
            'option1', 'option2', 'option3', 'option4'
        ]
        # Excludes: correct_option, explanation
    
    def get_question_image_url(self, obj):
        """Get full URL for question image"""
        if obj.question_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.question_image.url)
            return obj.question_image.url
        return None


class StudentTestListSerializer(serializers.ModelSerializer):
    """
    List available tests for student.
    """
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    chapter_name = serializers.CharField(source='chapter.name', read_only=True)
    subject_name = serializers.CharField(source='chapter.subject.name', read_only=True)
    question_count = serializers.SerializerMethodField()
    is_attempted = serializers.SerializerMethodField()
    my_best_score = serializers.SerializerMethodField()
    
    class Meta:
        model = Test
        fields = [
            'id', 'type', 'type_display', 'chapter_name',
            'subject_name', 'marks', 'question_count',
            'is_attempted', 'my_best_score'
        ]
    
    def get_question_count(self, obj):
        """Count questions in test"""
        return obj.question_set.count()
    
    def get_is_attempted(self, obj):
        """Check if current user attempted this test"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return TestAttempt.objects.filter(
                test=obj,
                student=request.user
            ).exists()
        return False
    
    def get_my_best_score(self, obj):
        """Get student's best score on this test"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            attempt = TestAttempt.objects.filter(
                test=obj,
                student=request.user
            ).order_by('-score').first()
            
            if attempt:
                return attempt.score
        return None


class StudentTestDetailSerializer(serializers.ModelSerializer):
    """
    Test details for taking the test.
    Includes questions but not answers.
    """
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    chapter_info = serializers.SerializerMethodField()
    questions = StudentQuestionSerializer(source='question_set', many=True, read_only=True)
    instructions = serializers.SerializerMethodField()
    
    class Meta:
        model = Test
        fields = [
            'id', 'type', 'type_display', 'chapter_info',
            'marks', 'questions', 'instructions'
        ]
    
    def get_chapter_info(self, obj):
        """Chapter information"""
        if obj.chapter:
            return {
                'id': obj.chapter.id,
                'name': obj.chapter.name,
                'subject': obj.chapter.subject.name
            }
        return None
    
    def get_instructions(self, obj):
        """Test instructions"""
        return {
            'total_questions': obj.question_set.count(),
            'total_marks': obj.marks,
            'type': obj.get_type_display(),
            'message': 'Read all questions carefully before answering. Good luck!'
        }


class StudentAnswerSubmitSerializer(serializers.ModelSerializer):
    """
    Submit answer to a question.
    """
    question_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = StudentAnswer
        fields = ['question_id', 'selected_option', 'descriptive_answer']
    
    def validate_question_id(self, value):
        """Validate question exists"""
        try:
            return Question.objects.get(id=value)
        except Question.DoesNotExist:
            raise serializers.ValidationError("Question not found.")
    
    def validate(self, attrs):
        """Validate answer type matches question type"""
        question = attrs['question_id']
        
        if question.test.type == 'mcq':
            if not attrs.get('selected_option'):
                raise serializers.ValidationError({
                    'selected_option': 'Selected option is required for MCQ questions.'
                })
            if attrs['selected_option'] not in [1, 2, 3, 4]:
                raise serializers.ValidationError({
                    'selected_option': 'Selected option must be between 1 and 4.'
                })
        
        elif question.test.type == 'descriptive':
            if not attrs.get('descriptive_answer'):
                raise serializers.ValidationError({
                    'descriptive_answer': 'Answer is required for descriptive questions.'
                })
        
        return attrs
    
    def create(self, validated_data):
        """Create or update student answer"""
        question = validated_data.pop('question_id')
        student = self.context['request'].user
        
        # Update if already answered, create if new
        answer, created = StudentAnswer.objects.update_or_create(
            student=student,
            question=question,
            defaults=validated_data
        )
        
        return answer


class TestSubmitSerializer(serializers.Serializer):
    """
    Submit entire test with all answers.
    """
    test_id = serializers.IntegerField()
    answers = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of {question_id, selected_option OR descriptive_answer}"
    )
    
    def validate_test_id(self, value):
        """Validate test exists"""
        try:
            return Test.objects.get(id=value)
        except Test.DoesNotExist:
            raise serializers.ValidationError("Test not found.")
    
    def validate(self, attrs):
        """Validate all questions are answered"""
        test = attrs['test_id']
        answers = attrs['answers']
        
        # Get all question IDs for this test
        question_ids = set(test.question_set.values_list('id', flat=True))
        answered_ids = set(a.get('question_id') for a in answers)
        
        # Check if all questions are answered
        unanswered = question_ids - answered_ids
        if unanswered:
            raise serializers.ValidationError(
                f"Please answer all questions. Missing: {len(unanswered)} question(s)."
            )
        
        return attrs
    
    def create(self, validated_data):
        """Submit test and calculate score"""
        test = validated_data['test_id']
        answers = validated_data['answers']
        student = self.context['request'].user
        
        # Save all answers
        score = 0
        total_questions = len(answers)
        
        for answer_data in answers:
            question = Question.objects.get(id=answer_data['question_id'])
            
            # Create answer record
            StudentAnswer.objects.update_or_create(
                student=student,
                question=question,
                defaults={
                    'selected_option': answer_data.get('selected_option'),
                    'descriptive_answer': answer_data.get('descriptive_answer', '')
                }
            )
            
            # Calculate score for MCQ only (descriptive needs manual grading)
            if test.type == 'mcq':
                if answer_data.get('selected_option') == question.correct_option:
                    score += 1
        
        # Calculate final score
        if test.type == 'mcq':
            final_score = round((score / total_questions) * test.marks, 2)
        else:
            # Descriptive tests need teacher grading
            final_score = 0
        
        # Create test attempt record
        attempt = TestAttempt.objects.create(
            student=student,
            test=test,
            score=final_score
        )
        
        return {
            'attempt_id': attempt.id,
            'test_type': test.type,
            'score': final_score if test.type == 'mcq' else None,
            'total_marks': test.marks,
            'message': 'Test submitted successfully!' if test.type == 'mcq' 
                      else 'Test submitted. Awaiting teacher grading.',
            'submitted_at': attempt.attempted_at
        }


# ═══════════════════════════════════════════════════════════
#  Test Results & History Serializers
# ═══════════════════════════════════════════════════════════

class TestAttemptListSerializer(serializers.ModelSerializer):
    """
    List student's test attempts.
    """
    test_name = serializers.SerializerMethodField()
    test_type = serializers.CharField(source='test.get_type_display', read_only=True)
    subject_name = serializers.CharField(
        source='test.chapter.subject.name',
        read_only=True
    )
    total_marks = serializers.IntegerField(source='test.marks', read_only=True)
    percentage = serializers.SerializerMethodField()
    grade = serializers.SerializerMethodField()
    
    class Meta:
        model = TestAttempt
        fields = [
            'id', 'test_name', 'test_type', 'subject_name',
            'score', 'total_marks', 'percentage', 'grade',
            'attempted_at'
        ]
    
    def get_test_name(self, obj):
        """Get test name from chapter"""
        if obj.test.chapter:
            return f"{obj.test.chapter.name} - {obj.test.get_type_display()}"
        return f"Test #{obj.test.id}"
    
    def get_percentage(self, obj):
        """Calculate percentage score"""
        if obj.test.marks > 0:
            return round((obj.score / obj.test.marks) * 100, 2)
        return 0
    
    def get_grade(self, obj):
        """Calculate letter grade"""
        percentage = self.get_percentage(obj)
        
        if percentage >= 90:
            return 'A+'
        elif percentage >= 80:
            return 'A'
        elif percentage >= 70:
            return 'B'
        elif percentage >= 60:
            return 'C'
        elif percentage >= 50:
            return 'D'
        else:
            return 'F'


class TestAttemptDetailSerializer(serializers.ModelSerializer):
    """
    Detailed test attempt with answers and correct solutions.
    """
    test_info = serializers.SerializerMethodField()
    questions_review = serializers.SerializerMethodField()
    statistics = serializers.SerializerMethodField()
    
    class Meta:
        model = TestAttempt
        fields = [
            'id', 'test_info', 'score', 'attempted_at',
            'questions_review', 'statistics'
        ]
    
    def get_test_info(self, obj):
        """Test information"""
        return {
            'id': obj.test.id,
            'type': obj.test.get_type_display(),
            'chapter': obj.test.chapter.name if obj.test.chapter else None,
            'subject': obj.test.chapter.subject.name if obj.test.chapter else None,
            'total_marks': obj.test.marks
        }
    
    def get_questions_review(self, obj):
        """Review all questions with student's answers"""
        questions = obj.test.question_set.all()
        review = []
        
        for question in questions:
            # Get student's answer
            student_answer = StudentAnswer.objects.filter(
                student=obj.student,
                question=question
            ).first()
            
            question_data = {
                'id': question.id,
                'question_text': question.question_text,
                'type': obj.test.type
            }
            
            if obj.test.type == 'mcq':
                question_data.update({
                    'options': [
                        question.option1,
                        question.option2,
                        question.option3,
                        question.option4
                    ],
                    'correct_option': question.correct_option,
                    'student_answer': student_answer.selected_option if student_answer else None,
                    'is_correct': (
                        student_answer.selected_option == question.correct_option
                        if student_answer else False
                    ),
                    'explanation': question.explanation
                })
            else:
                question_data.update({
                    'student_answer': student_answer.descriptive_answer if student_answer else None
                })
            
            review.append(question_data)
        
        return review
    
    def get_statistics(self, obj):
        """Attempt statistics"""
        if obj.test.type == 'mcq':
            total_questions = obj.test.question_set.count()
            correct_answers = StudentAnswer.objects.filter(
                student=obj.student,
                question__test=obj.test,
                selected_option=models.F('question__correct_option')
            ).count()
            
            return {
                'total_questions': total_questions,
                'correct_answers': correct_answers,
                'wrong_answers': total_questions - correct_answers,
                'accuracy': round((correct_answers / total_questions) * 100, 2) if total_questions > 0 else 0,
                'percentage': round((obj.score / obj.test.marks) * 100, 2) if obj.test.marks > 0 else 0
            }
        
        return {
            'status': 'Awaiting manual grading' if obj.score == 0 else 'Graded',
            'score': obj.score,
            'total_marks': obj.test.marks
        }


# ═══════════════════════════════════════════════════════════
#  Academic Progress Serializers
# ═══════════════════════════════════════════════════════════

class StudentChapterProgressSerializer(serializers.ModelSerializer):
    """
    Chapter progress with completion status.
    """
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    test_count = serializers.SerializerMethodField()
    assignment_count = serializers.SerializerMethodField()
    my_test_attempts = serializers.SerializerMethodField()
    
    class Meta:
        model = Chapter
        fields = [
            'id', 'name', 'subject_name', 'is_completed',
            'test_count', 'assignment_count', 'my_test_attempts'
        ]
    
    def get_test_count(self, obj):
        """Count tests for this chapter"""
        return obj.test_set.count()
    
    def get_assignment_count(self, obj):
        """Count assignments for this chapter"""
        return obj.assignment_set.count()
    
    def get_my_test_attempts(self, obj):
        """Student's attempts on chapter tests"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            attempts = TestAttempt.objects.filter(
                student=request.user,
                test__chapter=obj
            ).count()
            return attempts
        return 0


class StudentSubjectProgressSerializer(serializers.ModelSerializer):
    """
    Subject progress with chapters and tests.
    """
    chapters = StudentChapterProgressSerializer(
        source='chapter_set',
        many=True,
        read_only=True
    )
    total_chapters = serializers.SerializerMethodField()
    completed_chapters = serializers.SerializerMethodField()
    average_score = serializers.SerializerMethodField()
    
    class Meta:
        model = Subject
        fields = [
            'id', 'name', 'total_chapters', 'completed_chapters',
            'average_score', 'chapters'
        ]
    
    def get_total_chapters(self, obj):
        """Total chapters for student's class"""
        request = self.context.get('request')
        if request and request.user.class_assigned:
            return obj.chapter_set.filter(
                class_assigned=request.user.class_assigned
            ).count()
        return 0
    
    def get_completed_chapters(self, obj):
        """Completed chapters"""
        request = self.context.get('request')
        if request and request.user.class_assigned:
            return obj.chapter_set.filter(
                class_assigned=request.user.class_assigned,
                is_completed=True
            ).count()
        return 0
    
    def get_average_score(self, obj):
        """Average test score for this subject"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            attempts = TestAttempt.objects.filter(
                student=request.user,
                test__chapter__subject=obj
            )
            
            if attempts.exists():
                avg = attempts.aggregate(avg=Avg('score'))['avg']
                return round(avg, 2) if avg else 0
        return 0


# ═══════════════════════════════════════════════════════════
#  Assignment & Attendance Serializers
# ═══════════════════════════════════════════════════════════

class StudentAssignmentListSerializer(serializers.ModelSerializer):
    """
    List assignments for student.
    """
    teacher_name = serializers.CharField(
        source='teacher.get_full_name',
        read_only=True
    )
    chapter_name = serializers.CharField(source='chapter.name', read_only=True)
    subject_name = serializers.CharField(source='chapter.subject.name', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'teacher_name', 'chapter_name', 'subject_name',
            'description', 'file', 'file_url'
        ]
    
    def get_file_url(self, obj):
        """Get full URL for assignment file"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class StudentAttendanceListSerializer(serializers.ModelSerializer):
    """
    Student's attendance records.
    """
    teacher_name = serializers.CharField(
        source='teacher.get_full_name',
        read_only=True
    )
    status = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Attendance
        fields = ['id', 'teacher_name', 'date', 'time', 'is_present', 'status', 'status_display']
    
    def get_status(self, obj):
        """Boolean status"""
        return obj.is_present
    
    def get_status_display(self, obj):
        """Human-readable status"""
        return "Present ✓" if obj.is_present else "Absent ✗"


class StudentAttendanceStatsSerializer(serializers.Serializer):
    """
    Attendance statistics for student.
    """
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    
    def get_stats(self, student):
        """Calculate attendance statistics"""
        queryset = Attendance.objects.filter(student=student)
        
        # Apply date filters if provided
        start_date = self.validated_data.get('start_date')
        end_date = self.validated_data.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        total = queryset.count()
        present = queryset.filter(is_present=True).count()
        absent = queryset.filter(is_present=False).count()
        
        return {
            'total_days': total,
            'present_days': present,
            'absent_days': absent,
            'attendance_percentage': round((present / total) * 100, 2) if total > 0 else 0,
            'date_range': {
                'start': start_date,
                'end': end_date
            }
        }


# ═══════════════════════════════════════════════════════════
#  Doubt Management Serializers
# ═══════════════════════════════════════════════════════════

class StudentDoubtCreateSerializer(serializers.ModelSerializer):
    """
    Ask a new doubt.
    """
    class Meta:
        model = Doubt
        fields = ['subject', 'text', 'image']
    
    def validate(self, attrs):
        """At least text or image must be provided"""
        if not attrs.get('text') and not attrs.get('image'):
            raise serializers.ValidationError(
                "Please provide either text or image for your doubt."
            )
        return attrs
    
    def create(self, validated_data):
        """Create doubt with current student"""
        validated_data['student'] = self.context['request'].user
        return Doubt.objects.create(**validated_data)


class StudentDoubtListSerializer(serializers.ModelSerializer):
    """
    List student's doubts.
    """
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    reply_count = serializers.SerializerMethodField()
    is_answered = serializers.SerializerMethodField()
    
    class Meta:
        model = Doubt
        fields = [
            'id', 'subject_name', 'text', 'reply_count',
            'is_answered', 'created_at'
        ]
    
    def get_reply_count(self, obj):
        """Count replies"""
        return obj.doubtreply_set.count()
    
    def get_is_answered(self, obj):
        """Check if doubt has been answered"""
        return obj.doubtreply_set.exists()


# ═══════════════════════════════════════════════════════════
#  Fee & Notifications Serializers
# ═══════════════════════════════════════════════════════════

class StudentFeePaymentListSerializer(serializers.ModelSerializer):
    """
    Student's fee payment history.
    """
    receipt_url = serializers.SerializerMethodField()
    
    class Meta:
        model = FeePayment
        fields = ['id', 'amount', 'paid_at', 'receipt', 'receipt_url']
    
    def get_receipt_url(self, obj):
        """Get full URL for receipt"""
        if obj.receipt:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.receipt.url)
            return obj.receipt.url
        return None


class StudentNotificationListSerializer(serializers.ModelSerializer):
    """
    Student's notifications.
    """
    is_read = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'message', 'created_at', 'is_read']
    
    def get_is_read(self, obj):
        """Placeholder for read status (can be extended)"""
        # This can be extended with a separate NotificationRead model
        return False


# ═══════════════════════════════════════════════════════════
#  Student Dashboard Serializers
# ═══════════════════════════════════════════════════════════

class StudentDashboardStatsSerializer(serializers.Serializer):
    """
    Comprehensive dashboard statistics for student.
    """
    def get_stats(self, student):
        """Calculate student-specific statistics"""
        from django.db.models import F
        
        # Class and subjects
        class_info = None
        if student.class_assigned:
            class_info = {
                'id': student.class_assigned.id,
                'name': student.class_assigned.name,
                'total_subjects': student.class_assigned.subject_set.count()
            }
        
        # Test statistics
        test_attempts = TestAttempt.objects.filter(student=student)
        total_tests = test_attempts.count()
        
        if total_tests > 0:
            avg_score = test_attempts.aggregate(avg=Avg('score'))['avg']
            avg_percentage = round((avg_score / Test.objects.filter(
                testattempt__student=student
            ).aggregate(avg=Avg('marks'))['avg']) * 100, 2) if avg_score else 0
        else:
            avg_percentage = 0
        
        # Attendance statistics
        attendance_records = Attendance.objects.filter(student=student)
        total_attendance = attendance_records.count()
        present_count = attendance_records.filter(is_present=True).count()
        
        return {
            'profile': {
                'name': student.get_full_name() or student.username,
                'unique_id': student.unique_id,
                'email': student.email,
                'class': class_info
            },
            'academic': {
                'tests_taken': total_tests,
                'average_percentage': avg_percentage,
                'total_assignments': Assignment.objects.filter(
                    chapter__class_assigned=student.class_assigned
                ).count() if student.class_assigned else 0
            },
            'attendance': {
                'total_days': total_attendance,
                'present_days': present_count,
                'attendance_percentage': round(
                    (present_count / total_attendance) * 100, 2
                ) if total_attendance > 0 else 0
            },
            'doubts': {
                'total_asked': Doubt.objects.filter(student=student).count(),
                'pending': Doubt.objects.filter(
                    student=student
                ).annotate(
                    reply_count=Count('doubtreply')
                ).filter(reply_count=0).count()
            },
            'fees': {
                'total_paid': float(
                    FeePayment.objects.filter(
                        student=student
                    ).aggregate(total=Sum('amount'))['total'] or 0
                ),
                'payment_count': FeePayment.objects.filter(student=student).count()
            }
        }


# ═══════════════════════════════════════════════════════════
#  Export for easy import
# ═══════════════════════════════════════════════════════════

__all__ = [
    # Test Taking
    'StudentQuestionSerializer',
    'StudentTestListSerializer',
    'StudentTestDetailSerializer',
    'StudentAnswerSubmitSerializer',
    'TestSubmitSerializer',
    
    # Test Results
    'TestAttemptListSerializer',
    'TestAttemptDetailSerializer',
    
    # Academic Progress
    'StudentChapterProgressSerializer',
    'StudentSubjectProgressSerializer',
    
    # Assignments & Attendance
    'StudentAssignmentListSerializer',
    'StudentAttendanceListSerializer',
    'StudentAttendanceStatsSerializer',
    
    # Doubts
    'StudentDoubtCreateSerializer',
    'StudentDoubtListSerializer',
    
    # Fees & Notifications
    'StudentFeePaymentListSerializer',
    'StudentNotificationListSerializer',
    
    # Dashboard
    'StudentDashboardStatsSerializer',
]
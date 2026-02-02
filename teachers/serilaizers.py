# teachers/serializers.py
"""
Professional DRF Serializers for Teacher Functionality
Built for EduVibe - Educational Platform
Version: 2.0 (2026)
"""

from rest_framework import serializers
from django.db.models import Count, Avg, Q
from django.utils import timezone
from .models import (
    TeacherAssignment, Test, Question, Attendance,
    Assignment, Doubt, DoubtReply
)
from admin_tasks.models import Class, Subject, Chapter


# ═══════════════════════════════════════════════════════════
#  Teacher Assignment Serializers
# ═══════════════════════════════════════════════════════════

class TeacherAssignmentListSerializer(serializers.ModelSerializer):
    """
    List teacher's class-subject assignments.
    """
    teacher_name = serializers.CharField(
        source='teacher.get_full_name',
        read_only=True
    )
    class_name = serializers.CharField(source='class_assigned.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    student_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TeacherAssignment
        fields = [
            'id', 'teacher_name', 'class_name', 
            'subject_name', 'student_count'
        ]
    
    def get_student_count(self, obj):
        """Count students in assigned class"""
        return obj.class_assigned.customuser_set.filter(
            role='student',
            is_approved=True
        ).count()


class TeacherAssignmentCreateSerializer(serializers.ModelSerializer):
    """
    Create teacher assignment with validation.
    """
    teacher_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = TeacherAssignment
        fields = ['teacher_id', 'class_assigned', 'subject']
    
    def validate(self, attrs):
        """Validate teacher, subject in class, and no duplicates"""
        from users.models import CustomUser
        
        # Validate teacher
        teacher_id = attrs.get('teacher_id')
        try:
            teacher = CustomUser.objects.get(
                id=teacher_id,
                role='teacher',
                is_approved=True
            )
            attrs['teacher'] = teacher
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({
                'teacher_id': 'Teacher not found or not approved.'
            })
        
        # Validate subject is taught in class
        subject = attrs['subject']
        class_assigned = attrs['class_assigned']
        
        if class_assigned not in subject.classes.all():
            raise serializers.ValidationError({
                'subject': f"Subject '{subject.name}' is not taught in '{class_assigned.name}'"
            })
        
        # Check for duplicate assignment
        if TeacherAssignment.objects.filter(
            teacher=teacher,
            class_assigned=class_assigned,
            subject=subject
        ).exists():
            raise serializers.ValidationError(
                "This teacher is already assigned to teach this subject in this class."
            )
        
        return attrs
    
    def create(self, validated_data):
        """Create teacher assignment"""
        validated_data.pop('teacher_id')
        return TeacherAssignment.objects.create(**validated_data)


# ═══════════════════════════════════════════════════════════
#  Test & Question Serializers
# ═══════════════════════════════════════════════════════════

class QuestionSerializer(serializers.ModelSerializer):
    """
    Question serializer with image support.
    """
    question_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = [
            'id', 'question_text', 'question_image', 'question_image_url',
            'option1', 'option2', 'option3', 'option4',
            'correct_option', 'explanation'
        ]
        extra_kwargs = {
            'correct_option': {'write_only': True}  # Hidden from students
        }
    
    def get_question_image_url(self, obj):
        """Get full URL for question image"""
        if obj.question_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.question_image.url)
            return obj.question_image.url
        return None


class QuestionCreateSerializer(serializers.ModelSerializer):
    """
    Create question with validation based on test type.
    """
    class Meta:
        model = Question
        fields = [
            'test', 'question_text', 'question_image',
            'option1', 'option2', 'option3', 'option4',
            'correct_option', 'explanation'
        ]
    
    def validate(self, attrs):
        """Validate based on test type (MCQ or Descriptive)"""
        test = attrs.get('test')
        
        if test.type == 'mcq':
            # MCQ must have all 4 options and correct answer
            required_fields = ['option1', 'option2', 'option3', 'option4', 'correct_option']
            for field in required_fields:
                if not attrs.get(field):
                    raise serializers.ValidationError({
                        field: f"{field} is required for MCQ questions."
                    })
            
            # Validate correct_option is 1-4
            if attrs['correct_option'] not in [1, 2, 3, 4]:
                raise serializers.ValidationError({
                    'correct_option': 'Correct option must be between 1 and 4.'
                })
        
        elif test.type == 'descriptive':
            # Descriptive questions don't need options
            if any([attrs.get(f'option{i}') for i in range(1, 5)]):
                raise serializers.ValidationError(
                    "Descriptive questions should not have options."
                )
        
        # At least question_text or question_image must be present
        if not attrs.get('question_text') and not attrs.get('question_image'):
            raise serializers.ValidationError(
                "Either question_text or question_image must be provided."
            )
        
        return attrs


class TestListSerializer(serializers.ModelSerializer):
    """
    List tests with basic info.
    """
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    chapter_name = serializers.CharField(
        source='chapter.name',
        read_only=True,
        allow_null=True
    )
    class_name = serializers.CharField(
        source='chapter.class_assigned.name',
        read_only=True,
        allow_null=True
    )
    subject_name = serializers.CharField(
        source='chapter.subject.name',
        read_only=True,
        allow_null=True
    )
    question_count = serializers.SerializerMethodField()
    attempt_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Test
        fields = [
            'id', 'type', 'type_display', 'chapter_name',
            'class_name', 'subject_name', 'marks',
            'question_count', 'attempt_count'
        ]
    
    def get_question_count(self, obj):
        """Count questions in test"""
        return obj.question_set.count()
    
    def get_attempt_count(self, obj):
        """Count student attempts"""
        return obj.testattempt_set.count()


class TestDetailSerializer(serializers.ModelSerializer):
    """
    Detailed test information with questions.
    """
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    chapter_info = serializers.SerializerMethodField()
    questions = QuestionSerializer(source='question_set', many=True, read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name',
        read_only=True
    )
    statistics = serializers.SerializerMethodField()
    
    class Meta:
        model = Test
        fields = [
            'id', 'type', 'type_display', 'chapter_info', 'marks',
            'created_by_name', 'questions', 'statistics'
        ]
    
    def get_chapter_info(self, obj):
        """Detailed chapter information"""
        if obj.chapter:
            return {
                'id': obj.chapter.id,
                'name': obj.chapter.name,
                'subject': obj.chapter.subject.name,
                'class': obj.chapter.class_assigned.name
            }
        return None
    
    def get_statistics(self, obj):
        """Test statistics"""
        attempts = obj.testattempt_set.all()
        
        if not attempts.exists():
            return {
                'total_attempts': 0,
                'average_score': 0,
                'highest_score': 0,
                'lowest_score': 0
            }
        
        scores = attempts.values_list('score', flat=True)
        
        return {
            'total_attempts': attempts.count(),
            'average_score': round(sum(scores) / len(scores), 2),
            'highest_score': max(scores),
            'lowest_score': min(scores)
        }


class TestCreateSerializer(serializers.ModelSerializer):
    """
    Create test with chapter validation.
    """
    class Meta:
        model = Test
        fields = ['type', 'chapter', 'marks']
    
    def validate_marks(self, value):
        """Validate marks are positive"""
        if value <= 0:
            raise serializers.ValidationError("Marks must be greater than zero.")
        return value
    
    def validate_chapter(self, value):
        """Ensure chapter exists"""
        if not Chapter.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Invalid chapter.")
        return value
    
    def create(self, validated_data):
        """Create test with current user as creator"""
        validated_data['created_by'] = self.context['request'].user
        return Test.objects.create(**validated_data)


class TestWithQuestionsCreateSerializer(serializers.Serializer):
    """
    Create test with questions in one request.
    """
    type = serializers.ChoiceField(choices=['mcq', 'descriptive'])
    chapter_id = serializers.IntegerField()
    marks = serializers.IntegerField(min_value=1)
    questions = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        max_length=50
    )
    
    def validate_chapter_id(self, value):
        """Validate chapter exists"""
        try:
            return Chapter.objects.get(id=value)
        except Chapter.DoesNotExist:
            raise serializers.ValidationError("Chapter not found.")
    
    def validate(self, attrs):
        """Validate questions based on test type"""
        test_type = attrs['type']
        questions = attrs['questions']
        
        for idx, q in enumerate(questions, 1):
            if test_type == 'mcq':
                required = ['question_text', 'option1', 'option2', 'option3', 'option4', 'correct_option']
                for field in required:
                    if field not in q:
                        raise serializers.ValidationError({
                            'questions': f"Question {idx}: {field} is required for MCQ."
                        })
            else:
                if not q.get('question_text') and not q.get('question_image'):
                    raise serializers.ValidationError({
                        'questions': f"Question {idx}: Must have text or image."
                    })
        
        return attrs
    
    def create(self, validated_data):
        """Create test with all questions"""
        chapter = validated_data['chapter_id']
        questions_data = validated_data.pop('questions')
        
        # Create test
        test = Test.objects.create(
            type=validated_data['type'],
            chapter=chapter,
            marks=validated_data['marks'],
            created_by=self.context['request'].user
        )
        
        # Create questions
        questions = []
        for q_data in questions_data:
            questions.append(Question(test=test, **q_data))
        
        Question.objects.bulk_create(questions)
        
        return test


# ═══════════════════════════════════════════════════════════
#  Attendance Serializers
# ═══════════════════════════════════════════════════════════

class AttendanceListSerializer(serializers.ModelSerializer):
    """
    List attendance records.
    """
    student_name = serializers.CharField(
        source='student.get_full_name',
        read_only=True
    )
    student_unique_id = serializers.CharField(
        source='student.unique_id',
        read_only=True
    )
    class_name = serializers.CharField(source='class_assigned.name', read_only=True)
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'student_name', 'student_unique_id',
            'class_name', 'date', 'time', 'is_present', 'status'
        ]
    
    def get_status(self, obj):
        """Human-readable status"""
        return "Present" if obj.is_present else "Absent"


class AttendanceDetailSerializer(serializers.ModelSerializer):
    """
    Detailed attendance information.
    """
    teacher = serializers.SerializerMethodField()
    student = serializers.SerializerMethodField()
    class_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'teacher', 'student', 'class_info',
            'date', 'time', 'is_present'
        ]
    
    def get_teacher(self, obj):
        return {
            'id': obj.teacher.id,
            'name': obj.teacher.get_full_name() or obj.teacher.username,
            'unique_id': obj.teacher.unique_id
        }
    
    def get_student(self, obj):
        return {
            'id': obj.student.id,
            'name': obj.student.get_full_name() or obj.student.username,
            'unique_id': obj.student.unique_id,
            'email': obj.student.email
        }
    
    def get_class_info(self, obj):
        return {
            'id': obj.class_assigned.id,
            'name': obj.class_assigned.name
        }


class AttendanceMarkSerializer(serializers.Serializer):
    """
    Bulk mark attendance for a class.
    """
    class_id = serializers.IntegerField()
    date = serializers.DateField()
    time = serializers.TimeField(required=False)
    attendance_records = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of {student_id: int, is_present: bool}"
    )
    
    def validate_class_id(self, value):
        """Validate class exists"""
        try:
            return Class.objects.get(id=value)
        except Class.DoesNotExist:
            raise serializers.ValidationError("Class not found.")
    
    def validate_date(self, value):
        """Cannot mark attendance for future dates"""
        if value > timezone.now().date():
            raise serializers.ValidationError("Cannot mark attendance for future dates.")
        return value
    
    def validate_attendance_records(self, value):
        """Validate student IDs and required fields"""
        if not value:
            raise serializers.ValidationError("At least one attendance record is required.")
        
        for record in value:
            if 'student_id' not in record or 'is_present' not in record:
                raise serializers.ValidationError(
                    "Each record must have 'student_id' and 'is_present'."
                )
        
        return value
    
    def create(self, validated_data):
        """Mark attendance for all students"""
        class_obj = validated_data['class_id']
        date = validated_data['date']
        time = validated_data.get('time', timezone.now().time())
        records = validated_data['attendance_records']
        teacher = self.context['request'].user
        
        # Get student IDs from records
        student_ids = [r['student_id'] for r in records]
        
        # Validate all students exist and belong to class
        from users.models import CustomUser
        students = CustomUser.objects.filter(
            id__in=student_ids,
            role='student',
            class_assigned=class_obj,
            is_approved=True
        )
        
        if students.count() != len(student_ids):
            raise serializers.ValidationError(
                "One or more invalid student IDs or students not in this class."
            )
        
        # Create attendance records
        attendance_list = []
        for record in records:
            attendance_list.append(
                Attendance(
                    teacher=teacher,
                    student_id=record['student_id'],
                    class_assigned=class_obj,
                    date=date,
                    time=time,
                    is_present=record['is_present']
                )
            )
        
        Attendance.objects.bulk_create(attendance_list)
        
        return {
            'class': class_obj.name,
            'date': date,
            'total_marked': len(attendance_list),
            'present': sum(1 for r in records if r['is_present']),
            'absent': sum(1 for r in records if not r['is_present'])
        }


class AttendanceStatsSerializer(serializers.Serializer):
    """
    Attendance statistics for a student or class.
    """
    student_id = serializers.IntegerField(required=False)
    class_id = serializers.IntegerField(required=False)
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    
    def validate(self, attrs):
        """Must provide either student_id or class_id"""
        if not attrs.get('student_id') and not attrs.get('class_id'):
            raise serializers.ValidationError(
                "Either student_id or class_id must be provided."
            )
        return attrs


# ═══════════════════════════════════════════════════════════
#  Assignment Serializers
# ═══════════════════════════════════════════════════════════

class AssignmentListSerializer(serializers.ModelSerializer):
    """
    List assignments with basic info.
    """
    teacher_name = serializers.CharField(
        source='teacher.get_full_name',
        read_only=True
    )
    chapter_name = serializers.CharField(
        source='chapter.name',
        read_only=True,
        allow_null=True
    )
    subject_name = serializers.CharField(
        source='chapter.subject.name',
        read_only=True,
        allow_null=True
    )
    class_name = serializers.CharField(
        source='chapter.class_assigned.name',
        read_only=True,
        allow_null=True
    )
    has_file = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'teacher_name', 'chapter_name', 'subject_name',
            'class_name', 'description', 'has_file'
        ]
    
    def get_has_file(self, obj):
        """Check if file is attached"""
        return bool(obj.file)


class AssignmentDetailSerializer(serializers.ModelSerializer):
    """
    Detailed assignment information.
    """
    teacher = serializers.SerializerMethodField()
    chapter_info = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'teacher', 'chapter_info', 'description',
            'file', 'file_url'
        ]
    
    def get_teacher(self, obj):
        return {
            'id': obj.teacher.id,
            'name': obj.teacher.get_full_name() or obj.teacher.username,
            'email': obj.teacher.email
        }
    
    def get_chapter_info(self, obj):
        if obj.chapter:
            return {
                'id': obj.chapter.id,
                'name': obj.chapter.name,
                'subject': obj.chapter.subject.name,
                'class': obj.chapter.class_assigned.name
            }
        return None
    
    def get_file_url(self, obj):
        """Get full URL for assignment file"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class AssignmentCreateSerializer(serializers.ModelSerializer):
    """
    Create assignment with file upload.
    """
    class Meta:
        model = Assignment
        fields = ['chapter', 'description', 'file']
        extra_kwargs = {
            'description': {'required': True}
        }
    
    def validate_description(self, value):
        """Ensure description is not empty"""
        if not value.strip():
            raise serializers.ValidationError("Description cannot be empty.")
        return value.strip()
    
    def create(self, validated_data):
        """Create assignment with current user as teacher"""
        validated_data['teacher'] = self.context['request'].user
        return Assignment.objects.create(**validated_data)


# ═══════════════════════════════════════════════════════════
#  Doubt & Reply Serializers
# ═══════════════════════════════════════════════════════════

class DoubtReplySerializer(serializers.ModelSerializer):
    """
    Doubt reply with user info.
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_role = serializers.CharField(source='user.get_role_display', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = DoubtReply
        fields = [
            'id', 'user_name', 'user_role', 'text',
            'image', 'image_url', 'created_at'
        ]
    
    def get_image_url(self, obj):
        """Get full URL for reply image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class DoubtListSerializer(serializers.ModelSerializer):
    """
    List doubts with basic info.
    """
    student_name = serializers.CharField(
        source='student.get_full_name',
        read_only=True
    )
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    reply_count = serializers.SerializerMethodField()
    has_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Doubt
        fields = [
            'id', 'student_name', 'subject_name', 'text',
            'has_image', 'reply_count', 'created_at'
        ]
    
    def get_reply_count(self, obj):
        """Count replies to this doubt"""
        return obj.doubtreply_set.count()
    
    def get_has_image(self, obj):
        """Check if image is attached"""
        return bool(obj.image)


class DoubtDetailSerializer(serializers.ModelSerializer):
    """
    Detailed doubt with all replies.
    """
    student = serializers.SerializerMethodField()
    subject = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    replies = DoubtReplySerializer(source='doubtreply_set', many=True, read_only=True)
    
    class Meta:
        model = Doubt
        fields = [
            'id', 'student', 'subject', 'text',
            'image', 'image_url', 'created_at', 'replies'
        ]
    
    def get_student(self, obj):
        return {
            'id': obj.student.id,
            'name': obj.student.get_full_name() or obj.student.username,
            'unique_id': obj.student.unique_id
        }
    
    def get_subject(self, obj):
        return {
            'id': obj.subject.id,
            'name': obj.subject.name
        }
    
    def get_image_url(self, obj):
        """Get full URL for doubt image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class DoubtReplyCreateSerializer(serializers.ModelSerializer):
    """
    Create reply to a doubt.
    """
    doubt_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = DoubtReply
        fields = ['doubt_id', 'text', 'image']
    
    def validate_doubt_id(self, value):
        """Validate doubt exists"""
        try:
            return Doubt.objects.get(id=value)
        except Doubt.DoesNotExist:
            raise serializers.ValidationError("Doubt not found.")
    
    def validate(self, attrs):
        """At least text or image must be provided"""
        if not attrs.get('text') and not attrs.get('image'):
            raise serializers.ValidationError(
                "Either text or image must be provided."
            )
        return attrs
    
    def create(self, validated_data):
        """Create reply with current user"""
        doubt = validated_data.pop('doubt_id')
        validated_data['doubt'] = doubt
        validated_data['user'] = self.context['request'].user
        return DoubtReply.objects.create(**validated_data)


# ═══════════════════════════════════════════════════════════
#  Teacher Dashboard Serializers
# ═══════════════════════════════════════════════════════════

class TeacherDashboardStatsSerializer(serializers.Serializer):
    """
    Statistics for teacher dashboard.
    """
    def get_stats(self, teacher):
        """Calculate teacher-specific statistics"""
        return {
            'assignments': {
                'total_created': teacher.teacherassignment_set.count(),
                'classes': teacher.teacherassignment_set.values(
                    'class_assigned__name'
                ).distinct().count(),
                'subjects': teacher.subjects.count()
            },
            'tests': {
                'total_created': teacher.test_set.count(),
                'total_attempts': sum(
                    test.testattempt_set.count()
                    for test in teacher.test_set.all()
                )
            },
            'assignments_given': {
                'total': teacher.assignment_set.count()
            },
            'doubts': {
                'pending': Doubt.objects.filter(
                    subject__in=teacher.subjects.all()
                ).annotate(
                    reply_count=Count('doubtreply')
                ).filter(reply_count=0).count()
            },
            'attendance': {
                'records_marked': teacher.teacher_attendances.count()
            }
        }


# ═══════════════════════════════════════════════════════════
#  Export for easy import
# ═══════════════════════════════════════════════════════════

__all__ = [
    # Teacher Assignment
    'TeacherAssignmentListSerializer',
    'TeacherAssignmentCreateSerializer',
    
    # Test & Questions
    'QuestionSerializer',
    'QuestionCreateSerializer',
    'TestListSerializer',
    'TestDetailSerializer',
    'TestCreateSerializer',
    'TestWithQuestionsCreateSerializer',
    
    # Attendance
    'AttendanceListSerializer',
    'AttendanceDetailSerializer',
    'AttendanceMarkSerializer',
    'AttendanceStatsSerializer',
    
    # Assignments
    'AssignmentListSerializer',
    'AssignmentDetailSerializer',
    'AssignmentCreateSerializer',
    
    # Doubts
    'DoubtReplySerializer',
    'DoubtListSerializer',
    'DoubtDetailSerializer',
    'DoubtReplyCreateSerializer',
    
    # Dashboard
    'TeacherDashboardStatsSerializer',
]
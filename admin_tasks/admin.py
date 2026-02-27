# admin_tasks/admin.py - FIXED VERSION
from django.contrib import admin
from django.utils.html import format_html
from .models import Class, Subject, Chapter, Notification, FeePayment


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    """Enhanced Class admin"""
    list_display = ('name', 'student_count', 'subject_count', 'view_students')
    search_fields = ('name',)
    
    @admin.display(description='Students')
    def student_count(self, obj):
        from users.models import CustomUser
        count = CustomUser.objects.filter(
            class_assigned=obj,
            role='student',
            is_approved=True
        ).count()
        return format_html('<strong>{}</strong>', count)
    
    @admin.display(description='Subjects')
    def subject_count(self, obj):
        count = obj.subjects.all().count() 
        return format_html('<strong>{}</strong>', count)
    
    @admin.display(description='Actions')
    def view_students(self, obj):
        from users.models import CustomUser
        url = f"/admin/users/customuser/?class_assigned__id__exact={obj.id}"
        return format_html('<a href="{}">View Students</a>', url)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    """Enhanced Subject admin"""
    list_display = ('name', 'classes_display', 'chapter_count')
    search_fields = ('name',)
    filter_horizontal = ('classes',)
    
    fieldsets = (
        ('Subject Information', {
            'fields': ('name',),
            'description': 'Enter the subject name (e.g., Mathematics, Science, English)',
        }),
        ('Assign to Classes', {
            'fields': ('classes',),
            'description': 'Select which classes will have this subject.',
        }),
    )
    
    @admin.display(description='Classes')
    def classes_display(self, obj):
        classes = obj.classes.all()
        if not classes:
            return format_html('<span style="color: #999; font-style: italic;">No classes assigned</span>')
        class_names = ', '.join([c.name for c in classes[:3]])
        if classes.count() > 3:
            class_names += f' (+{classes.count() - 3} more)'
        return format_html('<span style="color: #2196F3;">{}</span>', class_names)
    
    @admin.display(description='Chapters')
    def chapter_count(self, obj):
        count = obj.chapters.count()  # ✅ FIXED: Use 'chapters' instead of 'chapter_set'
        if count == 0:
            return format_html('<span style="color: #999;">—</span>')
        return format_html('<strong style="color: #4CAF50;">{}</strong>', count)
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('classes')


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    """
    ✅ SIMPLIFIED WORKING VERSION
    Shows subjects with their classes in the label
    JavaScript filters dynamically
    """
    list_display = ('name', 'subject', 'class_assigned', 'order', 'is_completed', 'completion_status', 'test_count')
    list_filter = ('subject', 'class_assigned', 'is_completed')
    search_fields = ('name', 'subject__name', 'class_assigned__name')
    list_editable = ('is_completed',)
    ordering = ('subject', 'class_assigned', 'order')
    
    fieldsets = (
        ('Step 1: Select Class', {
            'fields': ('class_assigned',),
            'description': '⚠️ First select the class. The subject list will filter automatically.',
        }),
        ('Step 2: Select Subject', {
            'fields': ('subject',),
            'description': 'Only subjects assigned to the selected class will be shown.',
        }),
        ('Step 3: Chapter Details', {
            'fields': ('name', 'description', 'order', 'is_completed'),
        }),
    )
    
    @admin.display(description='Status')
    def completion_status(self, obj):
        if obj.is_completed:
            return format_html('<span style="color: #4CAF50; font-weight: bold;">✓ Completed</span>')
        return format_html('<span style="color: #FF9800; font-weight: bold;">⏳ In Progress</span>')
    
    @admin.display(description='Tests')
    def test_count(self, obj):
        try:
            from teachers.models import Test
            count = Test.objects.filter(chapter=obj).count()
            return count
        except:
            return 0
    
    def get_form(self, request, obj=None, **kwargs):
        """
        Override get_form to customize the subject field choices
        This adds class information to each subject option
        """
        form = super().get_form(request, obj, **kwargs)
        
        if 'subject' in form.base_fields:
            # Get all subjects with their classes
            subjects = Subject.objects.prefetch_related('classes').all()
            
            # Create custom choices with class info
            choices = [('', '-- Select a subject --')]
            for subject in subjects:
                classes = subject.classes.all()
                if classes.exists():
                    class_list = ', '.join([c.name for c in classes])
                    # Add data attribute as part of label (we'll parse it with JS)
                    class_ids = ','.join(str(c.id) for c in classes)
                    label = f"{subject.name} → [{class_list}] data-classes='{class_ids}'"
                    choices.append((subject.id, label))
                else:
                    choices.append((subject.id, f"{subject.name} → [No classes]"))
            
            form.base_fields['subject'].choices = choices
        
        return form
    
    def save_model(self, request, obj, form, change):
        """Validate that subject belongs to selected class"""
        if obj.class_assigned and obj.subject:
            if not obj.subject.classes.filter(id=obj.class_assigned.id).exists():
                from django.contrib import messages
                messages.error(
                    request,
                    f'❌ ERROR: Subject "{obj.subject.name}" is NOT assigned to "{obj.class_assigned.name}". '
                    f'Please assign the subject to this class first in Subject admin.'
                )
                return
        
        super().save_model(request, obj, form, change)
        from django.contrib import messages
        messages.success(request, f'✅ Chapter "{obj.name}" created successfully!')
    
    class Media:
        js = ('admin/js/chapter_filter.js',)
        css = {'all': ('admin/css/chapter_admin.css',)}


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title_preview', 'message_preview', 'recipient_info', 'created_at', 'is_read')
    list_filter = ('recipient_type', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'user__email', 'user__first_name', 'user__last_name')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'created_by')
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('title', 'message')
        }),
        ('Recipients', {
            'fields': ('recipient_type', 'user', 'target_class'),
            'description': 'Select recipient type and specific user/class if applicable'
        }),
        ('Status', {
            'fields': ('is_read', 'created_by', 'created_at')
        }),
    )
    
    @admin.display(description='Title')
    def title_preview(self, obj):
        return obj.title[:30] + '...' if len(obj.title) > 30 else obj.title
    
    @admin.display(description='Message')
    def message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    
    @admin.display(description='Recipient')
    def recipient_info(self, obj):
        if obj.recipient_type == 'individual' and obj.user:
            return format_html('<span style="color: #2196F3;">{}</span>', obj.user.get_full_name() or obj.user.email)
        elif obj.recipient_type == 'class_students' and obj.target_class:
            return format_html('<span style="color: #FF9800;">Class: {}</span>', obj.target_class.name)
        else:
            return format_html('<span style="color: #4CAF50; font-weight: bold;">📢 {}</span>', obj.get_recipient_type_display())
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:  # New notification
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(FeePayment)
class FeePaymentAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'student_name', 'amount_display', 'payment_date', 'payment_method', 'payment_status', 'has_receipt')
    list_filter = ('payment_date', 'payment_method', 'payment_status')  # ✅ FIXED: Changed from 'paid_at' to 'payment_date'
    search_fields = ('student__email', 'student__first_name', 'student__last_name', 'receipt_number', 'transaction_id')
    date_hierarchy = 'payment_date'  # ✅ FIXED: Changed from 'paid_at' to 'payment_date'
    readonly_fields = ('payment_date', 'receipt_number')  # ✅ FIXED: Changed from 'paid_at' to 'payment_date'
    ordering = ['-payment_date']
    
    fieldsets = (
        ('Student Information', {
            'fields': ('student',)
        }),
        ('Payment Details', {
            'fields': ('amount', 'payment_method', 'payment_status', 'transaction_id')
        }),
        ('Fee Period', {
            'fields': ('month', 'year'),
            'description': 'Specify the month and year for which this fee is being paid'
        }),
        ('Receipt & Records', {
            'fields': ('receipt_number', 'receipt', 'payment_date', 'recorded_by'),
        }),
        ('Additional Information', {
            'fields': ('remarks',),
            'classes': ('collapse',),
        }),
    )
    
    @admin.display(description='Student')
    def student_name(self, obj):
        return format_html(
            '<strong>{}</strong><br><span style="color: #666; font-size: 0.9em;">{}</span>',
            obj.student.get_full_name() or obj.student.email,
            obj.student.email
        )
    
    @admin.display(description='Amount')
    def amount_display(self, obj):
        return format_html('<strong style="color: #4CAF50; font-size: 1.1em;">₹{:,.2f}</strong>', obj.amount)
    
    @admin.display(description='Receipt', boolean=True)
    def has_receipt(self, obj):
        return bool(obj.receipt)
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:  # New payment
            obj.recorded_by = request.user
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'recorded_by')















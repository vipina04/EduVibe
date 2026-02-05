from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import AcademicClass, Subject, Chapter

admin.site.register(AcademicClass)
admin.site.register(Subject)
admin.site.register(Chapter)

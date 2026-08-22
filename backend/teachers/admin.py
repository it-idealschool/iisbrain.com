from django.contrib import admin
from .models import Teacher, TeacherGradeDivision, TeacherSubjectPeriod


class TeacherGradeDivisionInline(admin.TabularInline):
    model = TeacherGradeDivision
    extra = 1


class TeacherSubjectPeriodInline(admin.TabularInline):
    model = TeacherSubjectPeriod
    extra = 1


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['name', 'emp_no', 'position', 'section', 'total_periods', 'continue_service']
    search_fields = ['name', 'emp_no', 'qatar_id', 'email']
    list_filter = ['position', 'section', 'gender', 'continue_service']
    inlines = [TeacherGradeDivisionInline, TeacherSubjectPeriodInline]
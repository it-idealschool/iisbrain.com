from django.contrib import admin
from .models import AcademicYear, SchoolManpowerSettings, GradeDivision, SubjectGradeRequirement


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'is_current', 'status')
    list_filter = ('status', 'is_current')


@admin.register(SchoolManpowerSettings)
class SchoolManpowerSettingsAdmin(admin.ModelAdmin):
    list_display = ('student_teacher_ratio_target', 'default_class_capacity', 'standard_teacher_periods', 'updated_at')

    def has_add_permission(self, request):
        # Singleton — only allow editing the existing row.
        return not SchoolManpowerSettings.objects.exists()


@admin.register(GradeDivision)
class GradeDivisionAdmin(admin.ModelAdmin):
    list_display = ('grade', 'division', 'section_type', 'capacity', 'active', 'academic_year')
    list_filter = ('grade', 'section_type', 'active', 'academic_year')


@admin.register(SubjectGradeRequirement)
class SubjectGradeRequirementAdmin(admin.ModelAdmin):
    list_display = ('grade', 'subject', 'periods_per_week', 'section_type', 'academic_year')
    list_filter = ('grade', 'section_type', 'academic_year')

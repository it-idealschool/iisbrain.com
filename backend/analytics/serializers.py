from rest_framework import serializers

from .models import AcademicYear, SchoolManpowerSettings, GradeDivision, SubjectGradeRequirement


class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = ['id', 'name', 'start_date', 'end_date', 'is_current', 'status']


class SchoolManpowerSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolManpowerSettings
        fields = [
            'student_teacher_ratio_target',
            'default_class_capacity',
            'standard_teacher_periods',
            'workload_warning_percentage',
            'workload_critical_percentage',
            'class_capacity_warning_percentage',
            'contract_expiry_warning_days',
            'qid_expiry_warning_days',
            'ratio_warning_margin',
            'updated_at',
        ]


class GradeDivisionSerializer(serializers.ModelSerializer):
    grade_display = serializers.CharField(source='get_grade_display', read_only=True)

    class Meta:
        model = GradeDivision
        fields = [
            'id', 'academic_year', 'grade', 'grade_display', 'division',
            'section_type', 'capacity', 'active',
        ]


class SubjectGradeRequirementSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = SubjectGradeRequirement
        fields = [
            'id', 'academic_year', 'grade', 'subject', 'subject_name',
            'periods_per_week', 'section_type',
        ]

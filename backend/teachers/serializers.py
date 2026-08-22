from rest_framework import serializers
from .models import Teacher, TeacherGradeDivision, TeacherSubjectPeriod
from subjects.models import Subject
from subjects.serializers import SubjectSerializer


class TeacherGradeDivisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherGradeDivision
        fields = ['id', 'grade', 'division', 'periods_per_week']


class TeacherSubjectPeriodSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), source='subject', write_only=True
    )

    class Meta:
        model = TeacherSubjectPeriod
        fields = ['id', 'subject', 'subject_id', 'periods_per_week']


class TeacherSerializer(serializers.ModelSerializer):
    grade_divisions = TeacherGradeDivisionSerializer(many=True, required=False)
    subject_periods = TeacherSubjectPeriodSerializer(many=True, required=False)

    class Meta:
        model = Teacher
        fields = [
            'id', 'name', 'emp_no', 'photo_url', 'qatar_id', 'sponsor_status',
            'home_country_number', 'email', 'contact_number',
            'doj', 'contract_expiry', 'dob', 'age', 'gender', 'shift',
            'session', 'section', 'teaching_other_section', 'other_section_details',
            'ug_qualification', 'pg_qualification', 'other_diploma',
            'bed_qualified', 'bed_details', 'med_qualified', 'med_details', 'phd_qualified',
            'position', 'experience_iis', 'experience_overall',
            'class_teacher', 'class_teacher_grade_division',
            'total_periods',
            'continue_service', 'discontinue_reason', 'departure_date',
            'grade_divisions', 'subject_periods',
            'created_at', 'updated_at',
        ]

    def create(self, validated_data):
        grade_divisions_data = validated_data.pop('grade_divisions', [])
        subject_periods_data = validated_data.pop('subject_periods', [])
        teacher = Teacher.objects.create(**validated_data)
        for gd in grade_divisions_data:
            TeacherGradeDivision.objects.create(teacher=teacher, **gd)
        for sp in subject_periods_data:
            TeacherSubjectPeriod.objects.create(teacher=teacher, **sp)
        return teacher

    def update(self, instance, validated_data):
        grade_divisions_data = validated_data.pop('grade_divisions', None)
        subject_periods_data = validated_data.pop('subject_periods', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if grade_divisions_data is not None:
            instance.grade_divisions.all().delete()
            for gd in grade_divisions_data:
                TeacherGradeDivision.objects.create(teacher=instance, **gd)

        if subject_periods_data is not None:
            instance.subject_periods.all().delete()
            for sp in subject_periods_data:
                TeacherSubjectPeriod.objects.create(teacher=instance, **sp)

        return instance
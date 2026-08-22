from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'id', 'name', 'admission_no', 'grade', 'division',
            'dob', 'gender', 'parent_name', 'contact_number',
            'created_at', 'updated_at',
        ]
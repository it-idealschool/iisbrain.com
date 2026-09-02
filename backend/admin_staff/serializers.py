from rest_framework import serializers
from .models import AdminStaff, AdminPositionRequirement


class AdminStaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminStaff
        fields = [
            'id', 'name', 'position', 'photo_url', 'qatar_id', 'qatar_id_expiry', 'sponsor_status',
            'home_country_number', 'contact_number', 'email',
            'doj', 'contract_expiry', 'dob', 'age', 'gender', 'shift',
            'qualification', 'extra_qualification', 'certificate_url',
            'notes', 'created_at', 'updated_at',
        ]


class AdminPositionRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminPositionRequirement
        fields = ['id', 'position', 'required_count', 'key_responsibilities', 'updated_at']

from rest_framework import serializers
from .models import AdminStaff, AdminPositionRequirement


class AdminStaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminStaff
        fields = [
            'id', 'name', 'position', 'photo_url', 'qatar_id', 'sponsor_status',
            'home_country_number', 'contact_number', 'email',
            'doj', 'contract_expiry', 'dob', 'age', 'gender', 'shift',
            'ug_qualification', 'pg_qualification', 'other_diploma',
            'bed_qualified', 'bed_details', 'med_qualified', 'med_details', 'phd_qualified',
            'notes', 'created_at', 'updated_at',
        ]


class AdminPositionRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminPositionRequirement
        fields = ['id', 'position', 'required_count', 'key_responsibilities', 'updated_at']

from rest_framework import serializers
from .models import TransportStaff, TransportRoleRequirement, TransportSummary


class TransportStaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportStaff
        fields = [
            'id', 'name', 'role', 'photo_url', 'qatar_id', 'sponsor_status',
            'home_country_number', 'contact_number', 'email', 'license_number',
            'bus_number', 'route', 'is_substitute', 'doj', 'contract_expiry', 'dob', 'age',
            'gender', 'shift',
            'qualification', 'extra_qualification', 'certificate_url',
            'created_at', 'updated_at',
        ]


class TransportRoleRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportRoleRequirement
        fields = ['id', 'role', 'required_count', 'updated_at']


class TransportSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportSummary
        fields = [
            'id', 'number_of_buses', 'students_per_bus', 'working_hours',
            'overtime_notes', 'substitute_staff_availability',
            'route_wise_staffing_notes', 'updated_at',
        ]

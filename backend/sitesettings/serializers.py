from rest_framework import serializers
from .models import RegistrationSettings


class RegistrationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationSettings
        fields = [
            'teacher_registration_open',
            'admin_staff_registration_open',
            'transport_registration_open',
            'updated_at',
        ]
        read_only_fields = ['updated_at']

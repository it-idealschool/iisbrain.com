from rest_framework import serializers
from .models import AppraisalRecord, EmployeeProfile, HRAction, HRServiceRequest, LeaveRequest


class EmployeeProfileSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = EmployeeProfile
        fields = '__all__'


class HRActionSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.username', read_only=True)

    class Meta:
        model = HRAction
        fields = '__all__'


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    total_days = serializers.IntegerField(read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    actions = HRActionSerializer(many=True, read_only=True)

    class Meta:
        model = LeaveRequest
        fields = '__all__'

    def validate(self, attrs):
        if attrs['end_date'] < attrs['start_date']:
            raise serializers.ValidationError({'end_date': 'End date must be on or after start date.'})
        return attrs


class HRServiceRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    request_type_label = serializers.CharField(source='get_request_type_display', read_only=True)
    actions = HRActionSerializer(many=True, read_only=True)

    class Meta:
        model = HRServiceRequest
        fields = '__all__'


class AppraisalRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)

    class Meta:
        model = AppraisalRecord
        fields = '__all__'
        read_only_fields = ('reviewer',)

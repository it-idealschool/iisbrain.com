from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import Role, UserRole
from .models import EmployeeProfile, LeaveRequest


class HRWorkflowTests(TestCase):
    def test_leave_request_approval_chain(self):
        User = get_user_model()
        staff = User.objects.create_user(username='staff-member', password='test-pass-123')
        employee = EmployeeProfile.objects.create(user=staff, employee_number='E001', full_name='Staff Member', department='IT', designation='Technician')
        leave = LeaveRequest.objects.create(employee=employee, leave_type=LeaveRequest.ANNUAL, start_date='2026-10-01', end_date='2026-10-03', reason='Family')
        client = APIClient()
        stages = [
            (Role.DEPARTMENT_HEAD, LeaveRequest.PENDING_HR),
            (Role.HR, LeaveRequest.PENDING_PRINCIPAL),
            (Role.PRINCIPAL, LeaveRequest.APPROVED),
        ]
        for role_name, expected in stages:
            approver = User.objects.create_user(username=f'{role_name}-user', password='test-pass-123')
            role, _ = Role.objects.get_or_create(name=role_name)
            UserRole.objects.create(user=approver, role=role)
            client.force_authenticate(approver)
            response = client.post(f'/api/hr/leave-requests/{leave.id}/approve/', {}, format='json')
            self.assertEqual(response.status_code, 200)
            leave.refresh_from_db()
            self.assertEqual(leave.status, expected)

    def test_end_date_validation(self):
        user = get_user_model().objects.create_user(username='hr', password='test-pass-123')
        employee = EmployeeProfile.objects.create(user=user, employee_number='E002', full_name='HR User', department='HR', designation='Officer')
        client = APIClient(); client.force_authenticate(user)
        response = client.post('/api/hr/leave-requests/', {
            'employee': employee.id, 'leave_type': 'annual', 'start_date': '2026-10-05',
            'end_date': '2026-10-01', 'reason': 'Invalid date test',
        }, format='json')
        self.assertEqual(response.status_code, 400)

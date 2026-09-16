from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import Role, UserRole
from .models import DocumentCategory, PolicyDocument


class GovernanceModelTests(TestCase):
    def test_document_creation(self):
        user = get_user_model().objects.create_user(username='owner', password='test-pass-123')
        category = DocumentCategory.objects.create(name='Policies')
        document = PolicyDocument.objects.create(code='HR-001', title='Leave Policy', category=category, created_by=user)
        self.assertEqual(document.status, PolicyDocument.DRAFT)

    def test_principal_can_approve_document(self):
        user = get_user_model().objects.create_user(username='principal', password='test-pass-123')
        role, _ = Role.objects.get_or_create(name=Role.PRINCIPAL)
        UserRole.objects.create(user=user, role=role)
        category = DocumentCategory.objects.create(name='Manuals')
        document = PolicyDocument.objects.create(code='ADM-001', title='Administration Manual', category=category, created_by=user)
        client = APIClient()
        client.force_authenticate(user)
        response = client.post(f'/api/governance/documents/{document.id}/approve/', {}, format='json')
        self.assertEqual(response.status_code, 200)
        document.refresh_from_db()
        self.assertEqual(document.status, PolicyDocument.APPROVED)

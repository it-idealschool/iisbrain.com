import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.Model):
    SUPER_ADMIN = 'super_admin'
    MANAGEMENT = 'management'
    PRINCIPAL = 'principal'
    HR = 'hr'
    ACADEMIC_COORDINATOR = 'academic_coordinator'
    DEPARTMENT_HEAD = 'department_head'
    VIEWER_AUDITOR = 'viewer_auditor'

    ROLE_CHOICES = [
        (SUPER_ADMIN, 'Super Admin'),
        (MANAGEMENT, 'Management'),
        (PRINCIPAL, 'Principal'),
        (HR, 'HR'),
        (ACADEMIC_COORDINATOR, 'Academic Coordinator'),
        (DEPARTMENT_HEAD, 'Department Head'),
        (VIEWER_AUDITOR, 'Viewer/Auditor'),
    ]

    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.get_name_display()


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=20, blank=True)
    roles = models.ManyToManyField(Role, through='UserRole', through_fields=('user', 'role'), related_name='users')
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.username


class UserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    assigned_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_roles'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'role')

    def __str__(self):
        return f"{self.user.username} - {self.role.name}"

from django.core.management.base import BaseCommand
from accounts.models import Role


class Command(BaseCommand):
    help = 'Seed the 7 AASR roles into the database'

    def handle(self, *args, **options):
        role_data = [
            (Role.SUPER_ADMIN, 'Full system access'),
            (Role.MANAGEMENT, 'School management, strategic oversight'),
            (Role.PRINCIPAL, 'Academic and staffing approvals'),
            (Role.HR, 'Staff records and employment management'),
            (Role.ACADEMIC_COORDINATOR, 'Academic setup and allocation'),
            (Role.DEPARTMENT_HEAD, 'Department-level oversight'),
            (Role.VIEWER_AUDITOR, 'Read-only access with audit visibility'),
        ]

        for name, description in role_data:
            role, created = Role.objects.get_or_create(
                name=name,
                defaults={'description': description}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created role: {role.get_name_display()}'))
            else:
                self.stdout.write(self.style.WARNING(f'Role already exists: {role.get_name_display()}'))

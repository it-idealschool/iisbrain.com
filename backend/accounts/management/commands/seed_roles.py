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
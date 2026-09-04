from django.contrib import admin
from .models import RegistrationSettings


@admin.register(RegistrationSettings)
class RegistrationSettingsAdmin(admin.ModelAdmin):
    list_display = (
        'teacher_registration_open',
        'admin_staff_registration_open',
        'transport_registration_open',
        'updated_at',
    )

    def has_add_permission(self, request):
        # Singleton row only -- created automatically via RegistrationSettings.load()
        return not RegistrationSettings.objects.exists()

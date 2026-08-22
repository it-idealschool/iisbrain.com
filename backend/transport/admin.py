from django.contrib import admin
from .models import TransportStaff, TransportRoleRequirement, TransportSummary


@admin.register(TransportStaff)
class TransportStaffAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'sponsor_status', 'shift', 'route', 'contact_number', 'is_substitute']
    list_filter = ['role', 'is_substitute', 'sponsor_status', 'shift']
    search_fields = ['name', 'contact_number', 'route', 'license_number']


@admin.register(TransportRoleRequirement)
class TransportRoleRequirementAdmin(admin.ModelAdmin):
    list_display = ['role', 'required_count']


@admin.register(TransportSummary)
class TransportSummaryAdmin(admin.ModelAdmin):
    list_display = ['number_of_buses', 'students_per_bus', 'updated_at']

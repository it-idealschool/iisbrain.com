from django.contrib import admin
from .models import AdminStaff, AdminPositionRequirement


@admin.register(AdminStaff)
class AdminStaffAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'sponsor_status', 'shift', 'contact_number', 'email', 'doj']
    list_filter = ['position', 'sponsor_status', 'shift']
    search_fields = ['name', 'contact_number', 'email']


@admin.register(AdminPositionRequirement)
class AdminPositionRequirementAdmin(admin.ModelAdmin):
    list_display = ['position', 'required_count']

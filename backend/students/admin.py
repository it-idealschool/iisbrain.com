from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['name', 'admission_no', 'grade', 'division', 'gender', 'contact_number']
    list_filter = ['grade', 'division', 'gender']
    search_fields = ['name', 'admission_no', 'parent_name']
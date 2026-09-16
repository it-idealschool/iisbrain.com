from django.contrib import admin
from .models import AppraisalRecord, EmployeeProfile, HRAction, HRServiceRequest, LeaveRequest

admin.site.register(EmployeeProfile)
admin.site.register(LeaveRequest)
admin.site.register(HRServiceRequest)
admin.site.register(HRAction)
admin.site.register(AppraisalRecord)

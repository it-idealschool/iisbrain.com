from django.conf import settings
from django.db import models


class EmployeeProfile(models.Model):
    ACTIVE = 'active'
    ON_LEAVE = 'on_leave'
    INACTIVE = 'inactive'
    STATUS_CHOICES = [(ACTIVE, 'Active'), (ON_LEAVE, 'On Leave'), (INACTIVE, 'Inactive')]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='employee_profile')
    employee_number = models.CharField(max_length=60, unique=True)
    full_name = models.CharField(max_length=180)
    department = models.CharField(max_length=120)
    designation = models.CharField(max_length=120)
    employment_type = models.CharField(max_length=40, default='full_time')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=ACTIVE)
    date_of_joining = models.DateField(null=True, blank=True)
    contract_expiry = models.DateField(null=True, blank=True)
    qatar_id = models.CharField(max_length=30, blank=True)
    qatar_id_expiry = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    emergency_contact = models.CharField(max_length=180, blank=True)
    annual_leave_entitlement = models.PositiveIntegerField(default=30)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('full_name',)

    def __str__(self):
        return f'{self.employee_number} - {self.full_name}'


class LeaveRequest(models.Model):
    ANNUAL = 'annual'
    SICK = 'sick'
    EMERGENCY = 'emergency'
    UNPAID = 'unpaid'
    LEAVE_TYPES = [(ANNUAL, 'Annual'), (SICK, 'Sick'), (EMERGENCY, 'Emergency'), (UNPAID, 'Unpaid')]
    PENDING_HOS = 'pending_hos'
    PENDING_HR = 'pending_hr'
    PENDING_PRINCIPAL = 'pending_principal'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    RETURNED = 'returned'
    STATUS_CHOICES = [
        (PENDING_HOS, 'Pending HOS'), (PENDING_HR, 'Pending HR'),
        (PENDING_PRINCIPAL, 'Pending Principal'), (APPROVED, 'Approved'),
        (REJECTED, 'Rejected'), (RETURNED, 'Returned for Correction'),
    ]

    employee = models.ForeignKey(EmployeeProfile, on_delete=models.PROTECT, related_name='leave_requests')
    leave_type = models.CharField(max_length=30, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    attachment = models.FileField(upload_to='hr/leave/%Y/%m/', blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=PENDING_HOS)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)

    @property
    def total_days(self):
        return (self.end_date - self.start_date).days + 1


class HRServiceRequest(models.Model):
    NOC = 'noc'
    EMPLOYMENT_CERTIFICATE = 'employment_certificate'
    SALARY_CERTIFICATE = 'salary_certificate'
    ID_RENEWAL = 'id_renewal'
    CONTRACT_RENEWAL = 'contract_renewal'
    OTHER = 'other'
    REQUEST_TYPES = [
        (NOC, 'NOC'), (EMPLOYMENT_CERTIFICATE, 'Employment Certificate'),
        (SALARY_CERTIFICATE, 'Salary Certificate'), (ID_RENEWAL, 'Qatar ID Renewal'),
        (CONTRACT_RENEWAL, 'Contract Renewal'), (OTHER, 'Other'),
    ]
    PENDING_HR = 'pending_hr'
    PENDING_PRINCIPAL = 'pending_principal'
    COMPLETED = 'completed'
    REJECTED = 'rejected'
    RETURNED = 'returned'
    STATUS_CHOICES = [
        (PENDING_HR, 'Pending HR'), (PENDING_PRINCIPAL, 'Pending Principal'),
        (COMPLETED, 'Completed'), (REJECTED, 'Rejected'), (RETURNED, 'Returned'),
    ]

    employee = models.ForeignKey(EmployeeProfile, on_delete=models.PROTECT, related_name='service_requests')
    request_type = models.CharField(max_length=40, choices=REQUEST_TYPES)
    purpose = models.TextField()
    required_by = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=PENDING_HR)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)


class HRAction(models.Model):
    leave_request = models.ForeignKey(LeaveRequest, on_delete=models.CASCADE, null=True, blank=True, related_name='actions')
    service_request = models.ForeignKey(HRServiceRequest, on_delete=models.CASCADE, null=True, blank=True, related_name='actions')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=40)
    from_status = models.CharField(max_length=30, blank=True)
    to_status = models.CharField(max_length=30, blank=True)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('created_at',)


class AppraisalRecord(models.Model):
    employee = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name='appraisals')
    academic_year = models.CharField(max_length=20)
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    performance_score = models.DecimalField(max_digits=4, decimal_places=2)
    strengths = models.TextField(blank=True)
    development_areas = models.TextField(blank=True)
    goals = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=[('draft', 'Draft'), ('finalized', 'Finalized')], default='draft')
    review_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'academic_year')
        ordering = ('-review_date',)

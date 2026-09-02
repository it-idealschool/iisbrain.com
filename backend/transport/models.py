import uuid
from django.db import models

ROLE_CHOICES = [
    ('COORDINATOR', 'Transport Coordinator'),
    ('DRIVER', 'Driver'),
    ('ATTENDANT', 'Bus Attendant / Conductor'),
]

GENDER_CHOICES = [('MALE', 'Male'), ('FEMALE', 'Female'), ('OTHER', 'Other')]

YES_NO_CHOICES = [('YES', 'Yes'), ('NO', 'No')]

SPONSOR_CHOICES = [('SPONSORED', 'Sponsored'), ('NON_SPONSORED', 'Non-Sponsored')]

SHIFT_CHOICES = [('MORNING', 'Morning'), ('EVENING', 'Evening'), ('BOTH', 'Both')]

QUALIFICATION_CHOICES = [
    ('PLUS_TWO', '+2'),
    ('DIPLOMA', 'Diploma'),
    ('GRADUATED', 'Graduated'),
    ('POST_GRADUATED', 'Post Graduated'),
]


class TransportStaff(models.Model):
    """An individual transport staff member (coordinator, driver, attendant)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=255)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    photo_url = models.TextField(blank=True)  # data-URL (base64) or hosted image URL
    qatar_id = models.CharField(max_length=100, blank=True)
    sponsor_status = models.CharField(max_length=20, choices=SPONSOR_CHOICES, blank=True)
    home_country_number = models.CharField(max_length=100, blank=True)
    contact_number = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    bus_number = models.CharField(max_length=100, blank=True)
    route = models.CharField(max_length=100, blank=True)
    is_substitute = models.BooleanField(default=False)

    doj = models.DateField(null=True, blank=True)
    contract_expiry = models.DateField(null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    age = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, blank=True)

    # Qualifications
    qualification = models.CharField(max_length=20, choices=QUALIFICATION_CHOICES, blank=True)
    extra_qualification = models.CharField(max_length=255, blank=True)
    certificate_url = models.TextField(blank=True)  # data-URL (base64) of the uploaded certificate

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['role', 'name']
        verbose_name_plural = 'Transport staff'

    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"


class TransportRoleRequirement(models.Model):
    """Manually-set required headcount for a transport role."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    role = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    required_count = models.PositiveIntegerField(default=0)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['role']

    def __str__(self):
        return f"{self.get_role_display()} — required {self.required_count}"


class TransportSummary(models.Model):
    """
    Single settings-style record holding fleet-level summary numbers.
    The frontend treats this as one row (creates it once, then edits it).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    number_of_buses = models.PositiveIntegerField(default=0)
    students_per_bus = models.PositiveIntegerField(null=True, blank=True)
    working_hours = models.CharField(max_length=255, blank=True)
    overtime_notes = models.TextField(blank=True)
    substitute_staff_availability = models.TextField(blank=True)
    route_wise_staffing_notes = models.TextField(blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Transport summary'

    def __str__(self):
        return f"Transport summary ({self.number_of_buses} buses)"

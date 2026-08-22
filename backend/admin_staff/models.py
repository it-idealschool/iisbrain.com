import uuid
from django.db import models

POSITION_CHOICES = [
    ('PRINCIPAL', 'Principal'),
    ('VICE_PRINCIPAL', 'Vice Principal'),
    ('HR_ADMIN', 'HR / Admin'),
    ('ACCOUNTS', 'Accounts'),
    ('RECEPTION', 'Reception'),
    ('ADMISSIONS', 'Admissions'),
    ('IT_DATA_ENTRY', 'IT / Data Entry'),
    ('SECRETARY', 'Secretary'),
    ('PRO_CUSTOMER_SERVICE', 'PRO / Customer Service'),
    ('OFFICE_SUPPORT', 'Office Support Staff'),
]

GENDER_CHOICES = [('MALE', 'Male'), ('FEMALE', 'Female'), ('OTHER', 'Other')]

YES_NO_CHOICES = [('YES', 'Yes'), ('NO', 'No')]

SPONSOR_CHOICES = [('SPONSORED', 'Sponsored'), ('NON_SPONSORED', 'Non-Sponsored')]

SHIFT_CHOICES = [('MORNING', 'Morning'), ('EVENING', 'Evening'), ('BOTH', 'Both')]


class AdminStaff(models.Model):
    """An individual administrative / management staff member."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=255)
    position = models.CharField(max_length=50, choices=POSITION_CHOICES)
    photo_url = models.TextField(blank=True)  # data-URL (base64) or hosted image URL
    qatar_id = models.CharField(max_length=100, blank=True)
    sponsor_status = models.CharField(max_length=20, choices=SPONSOR_CHOICES, blank=True)
    home_country_number = models.CharField(max_length=100, blank=True)
    contact_number = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)

    doj = models.DateField(null=True, blank=True)
    contract_expiry = models.DateField(null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    age = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, blank=True)

    # Qualifications
    ug_qualification = models.CharField(max_length=255, blank=True)
    pg_qualification = models.CharField(max_length=255, blank=True)
    other_diploma = models.CharField(max_length=255, blank=True)
    bed_qualified = models.CharField(max_length=10, choices=YES_NO_CHOICES, blank=True)
    bed_details = models.CharField(max_length=255, blank=True)
    med_qualified = models.CharField(max_length=10, choices=YES_NO_CHOICES, blank=True)
    med_details = models.CharField(max_length=255, blank=True)
    phd_qualified = models.CharField(max_length=10, choices=YES_NO_CHOICES, blank=True)

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position', 'name']
        verbose_name_plural = 'Admin staff'

    def __str__(self):
        return f"{self.name} ({self.get_position_display()})"


class AdminPositionRequirement(models.Model):
    """Manually-set required headcount + responsibilities for an admin position."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    position = models.CharField(max_length=50, choices=POSITION_CHOICES, unique=True)
    required_count = models.PositiveIntegerField(default=0)
    key_responsibilities = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.get_position_display()} — required {self.required_count}"

import uuid
from django.db import models
from subjects.models import Subject

GRADE_CHOICES = [
    ('KG-1', 'KG - 1'), ('KG-2', 'KG - 2'),
    ('GRADE-1', 'Grade - 1'), ('GRADE-2', 'Grade - 2'), ('GRADE-3', 'Grade - 3'),
    ('GRADE-4', 'Grade - 4'), ('GRADE-5', 'Grade - 5'), ('GRADE-6', 'Grade - 6'),
    ('GRADE-7', 'Grade - 7'), ('GRADE-8', 'Grade - 8'), ('GRADE-9', 'Grade - 9'),
    ('GRADE-10', 'Grade - 10'), ('GRADE-11', 'Grade - 11'), ('GRADE-12', 'Grade - 12'),
]

POSITION_CHOICES = [
    ('KG', 'KG'), ('PRT', 'PRT'), ('TGT', 'TGT'), ('PGT', 'PGT'), ('OTHER', 'Other'),
]

GENDER_CHOICES = [('MALE', 'Male'), ('FEMALE', 'Female'), ('OTHER', 'Other')]

YES_NO_CHOICES = [('YES', 'Yes'), ('NO', 'No')]

SPONSOR_CHOICES = [('SPONSORED', 'Sponsored'), ('NON_SPONSORED', 'Non-Sponsored')]

SHIFT_CHOICES = [('MORNING', 'Morning'), ('EVENING', 'Evening'), ('BOTH', 'Both')]


class Teacher(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Personal details
    name = models.CharField(max_length=255)
    emp_no = models.CharField(max_length=100, unique=True)
    photo_url = models.TextField(blank=True)  # data-URL (base64) or hosted image URL
    qatar_id = models.CharField(max_length=100, blank=True)
    sponsor_status = models.CharField(max_length=20, choices=SPONSOR_CHOICES, blank=True)
    home_country_number = models.CharField(max_length=100, blank=True)
    email = models.EmailField()
    contact_number = models.CharField(max_length=100, blank=True)

    doj = models.DateField(null=True, blank=True)
    contract_expiry = models.DateField(null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    age = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, blank=True)

    session = models.CharField(max_length=50, blank=True)
    section = models.CharField(max_length=50, blank=True)
    teaching_other_section = models.CharField(max_length=10, choices=YES_NO_CHOICES, blank=True)
    other_section_details = models.TextField(blank=True)

    # Qualifications
    ug_qualification = models.CharField(max_length=255, blank=True)
    pg_qualification = models.CharField(max_length=255, blank=True)
    other_diploma = models.CharField(max_length=255, blank=True)
    bed_qualified = models.CharField(max_length=10, choices=YES_NO_CHOICES, blank=True)
    bed_details = models.CharField(max_length=255, blank=True)
    med_qualified = models.CharField(max_length=10, choices=YES_NO_CHOICES, blank=True)
    med_details = models.CharField(max_length=255, blank=True)
    phd_qualified = models.CharField(max_length=10, choices=YES_NO_CHOICES, blank=True)

    position = models.CharField(max_length=50, choices=POSITION_CHOICES, blank=True)
    experience_iis = models.CharField(max_length=20, blank=True)
    experience_overall = models.CharField(max_length=20, blank=True)

    # Class teacher info
    class_teacher = models.CharField(max_length=10, choices=YES_NO_CHOICES, blank=True)
    class_teacher_grade_division = models.CharField(max_length=255, blank=True)

    total_periods = models.PositiveIntegerField(null=True, blank=True)

    continue_service = models.CharField(max_length=10, choices=YES_NO_CHOICES, blank=True)
    discontinue_reason = models.TextField(blank=True)
    departure_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.emp_no})"


class TeacherGradeDivision(models.Model):
    """Which grade + division a teacher handles, with periods/week for that combination."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(Teacher, related_name='grade_divisions', on_delete=models.CASCADE)
    grade = models.CharField(max_length=20, choices=GRADE_CHOICES)
    division = models.CharField(max_length=10, blank=True)
    periods_per_week = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        unique_together = ('teacher', 'grade', 'division')

    def __str__(self):
        return f"{self.teacher.name} - {self.grade} {self.division}"


class TeacherSubjectPeriod(models.Model):
    """Which subject a teacher handles, with periods/week for that subject."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(Teacher, related_name='subject_periods', on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, related_name='teacher_periods', on_delete=models.CASCADE)
    periods_per_week = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        unique_together = ('teacher', 'subject')

    def __str__(self):
        return f"{self.teacher.name} - {self.subject.name}"
import uuid
from django.db import models

from students.models import GRADE_CHOICES
from teachers.models import SECTION_TYPE_CHOICES
from subjects.models import Subject


class AcademicYear(models.Model):
    """A school year, e.g. 2025-2026. Manpower planning and enrolment
    figures are (eventually) scoped to a specific academic year so
    management can compare year over year instead of using lifetime data."""

    STATUS_CHOICES = [
        ('PLANNING', 'Planning'),
        ('ACTIVE', 'Active'),
        ('CLOSED', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=20, unique=True)  # e.g. "2025-2026"
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNING')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Only one academic year may be "current" at a time.
        if self.is_current:
            AcademicYear.objects.exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)


class SchoolManpowerSettings(models.Model):
    """Singleton row holding the configurable planning benchmarks used
    throughout the analytics module. Nothing here is a hard-coded legal
    requirement — every school can tune these to its own policy."""

    student_teacher_ratio_target = models.DecimalField(max_digits=5, decimal_places=2, default=28)
    default_class_capacity = models.PositiveIntegerField(default=28)
    standard_teacher_periods = models.PositiveIntegerField(default=30)

    workload_warning_percentage = models.PositiveIntegerField(default=101)
    workload_critical_percentage = models.PositiveIntegerField(default=116)
    class_capacity_warning_percentage = models.PositiveIntegerField(default=86)

    contract_expiry_warning_days = models.PositiveIntegerField(default=90)
    qid_expiry_warning_days = models.PositiveIntegerField(default=60)

    ratio_warning_margin = models.DecimalField(
        max_digits=5, decimal_places=2, default=2,
        help_text="Ratio points above target that count as WARNING before CRITICAL.",
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "School manpower settings"
        verbose_name_plural = "School manpower settings"

    def __str__(self):
        return "School manpower settings"

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


class GradeDivision(models.Model):
    """A single class/division within a grade for a given academic year,
    e.g. Grade 5 - B. Used for capacity and class-teacher analysis."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    academic_year = models.ForeignKey(
        AcademicYear, related_name='grade_divisions', null=True, blank=True, on_delete=models.SET_NULL,
    )
    grade = models.CharField(max_length=20, choices=GRADE_CHOICES)
    division = models.CharField(max_length=10)
    section_type = models.CharField(max_length=20, choices=SECTION_TYPE_CHOICES, blank=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)  # overrides default_class_capacity when set
    active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('academic_year', 'grade', 'division')
        ordering = ['grade', 'division']

    def __str__(self):
        return f"{self.get_grade_display()} {self.division}"


class SubjectGradeRequirement(models.Model):
    """How many periods/week a subject should be taught in a given grade,
    for a given academic year. Feeds subject staffing calculations."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    academic_year = models.ForeignKey(
        AcademicYear, related_name='subject_grade_requirements', null=True, blank=True,
        on_delete=models.SET_NULL,
    )
    grade = models.CharField(max_length=20, choices=GRADE_CHOICES)
    subject = models.ForeignKey(Subject, related_name='grade_requirements', on_delete=models.CASCADE)
    periods_per_week = models.PositiveIntegerField(default=0)
    section_type = models.CharField(max_length=20, choices=SECTION_TYPE_CHOICES, blank=True)

    class Meta:
        unique_together = ('academic_year', 'grade', 'subject', 'section_type')
        ordering = ['grade', 'subject__name']

    def __str__(self):
        return f"{self.grade} - {self.subject.name} ({self.periods_per_week}/wk)"

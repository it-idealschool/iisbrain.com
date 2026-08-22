import uuid
from django.db import models

GRADE_CHOICES = [
    ('KG-1', 'KG - 1'), ('KG-2', 'KG - 2'),
    ('GRADE-1', 'Grade - 1'), ('GRADE-2', 'Grade - 2'), ('GRADE-3', 'Grade - 3'),
    ('GRADE-4', 'Grade - 4'), ('GRADE-5', 'Grade - 5'), ('GRADE-6', 'Grade - 6'),
    ('GRADE-7', 'Grade - 7'), ('GRADE-8', 'Grade - 8'), ('GRADE-9', 'Grade - 9'),
    ('GRADE-10', 'Grade - 10'), ('GRADE-11', 'Grade - 11'), ('GRADE-12', 'Grade - 12'),
]

GENDER_CHOICES = [('MALE', 'Male'), ('FEMALE', 'Female'), ('OTHER', 'Other')]


class Student(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=255)
    admission_no = models.CharField(max_length=100, unique=True)
    grade = models.CharField(max_length=20, choices=GRADE_CHOICES, blank=True)
    division = models.CharField(max_length=10, blank=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)

    parent_name = models.CharField(max_length=255, blank=True)
    contact_number = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.admission_no})"
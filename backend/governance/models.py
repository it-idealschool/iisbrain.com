from django.conf import settings
from django.db import models


class DocumentCategory(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('name',)

    def __str__(self):
        return self.name


class PolicyDocument(models.Model):
    POLICY = 'policy'
    PROCEDURE = 'procedure'
    REGULATION = 'regulation'
    MANUAL = 'manual'
    STANDARD = 'standard'
    CIRCULAR = 'circular'
    FORM = 'form'
    OTHER = 'other'
    TYPE_CHOICES = [
        (POLICY, 'Policy'), (PROCEDURE, 'Procedure'),
        (REGULATION, 'Regulation'), (MANUAL, 'Manual'),
        (STANDARD, 'Standard'), (CIRCULAR, 'Circular'),
        (FORM, 'Form'), (OTHER, 'Other'),
    ]
    DRAFT = 'draft'
    UNDER_REVIEW = 'under_review'
    APPROVED = 'approved'
    ARCHIVED = 'archived'
    STATUS_CHOICES = [
        (DRAFT, 'Draft'), (UNDER_REVIEW, 'Under Review'),
        (APPROVED, 'Approved'), (ARCHIVED, 'Archived'),
    ]

    code = models.CharField(max_length=60, unique=True)
    title = models.CharField(max_length=240)
    document_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default=POLICY)
    category = models.ForeignKey(DocumentCategory, on_delete=models.PROTECT, related_name='documents')
    summary = models.TextField(blank=True)
    owner_department = models.CharField(max_length=120, blank=True)
    version = models.CharField(max_length=30, default='1.0')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=DRAFT)
    effective_date = models.DateField(null=True, blank=True)
    review_date = models.DateField(null=True, blank=True)
    file = models.FileField(upload_to='governance/%Y/%m/', blank=True)
    external_url = models.URLField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='documents_created')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents_approved')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-updated_at',)

    def __str__(self):
        return f'{self.code} - {self.title}'


class DocumentActivity(models.Model):
    document = models.ForeignKey(PolicyDocument, on_delete=models.CASCADE, related_name='activities')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=60)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

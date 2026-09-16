from django.conf import settings
from django.db import models


class ItemCategory(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Item categories'
        ordering = ('name',)

    def __str__(self):
        return self.name


class InventoryItem(models.Model):
    category = models.ForeignKey(ItemCategory, on_delete=models.PROTECT, related_name='items')
    sku = models.CharField(max_length=60, unique=True)
    name = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=40, default='piece')
    stock_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    reorder_level = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    location = models.CharField(max_length=120, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('name',)

    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.reorder_level

    def __str__(self):
        return f'{self.sku} - {self.name}'


class ItemRequest(models.Model):
    SUBMITTED = 'submitted'
    HOS_APPROVED = 'hos_approved'
    FACILITY_APPROVED = 'facility_approved'
    PRINCIPAL_APPROVED = 'principal_approved'
    ISSUED = 'issued'
    REJECTED = 'rejected'
    RETURNED = 'returned'
    STATUS_CHOICES = [
        (SUBMITTED, 'Pending HOS'), (HOS_APPROVED, 'Pending Facility Manager'),
        (FACILITY_APPROVED, 'Pending Principal'), (PRINCIPAL_APPROVED, 'Approved / Pending Store'),
        (ISSUED, 'Issued'), (REJECTED, 'Rejected'), (RETURNED, 'Returned for Correction'),
    ]

    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='item_requests')
    department = models.CharField(max_length=120)
    purpose = models.TextField()
    priority = models.CharField(max_length=20, choices=[('normal', 'Normal'), ('urgent', 'Urgent')], default='normal')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=SUBMITTED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'REQ-{self.pk} / {self.requester}'


class ItemRequestLine(models.Model):
    request = models.ForeignKey(ItemRequest, on_delete=models.CASCADE, related_name='lines')
    item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT, null=True, blank=True)
    requested_item_name = models.CharField(max_length=180, blank=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    approved_quantity = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    notes = models.CharField(max_length=300, blank=True)

    def clean(self):
        if self.item and not self.requested_item_name:
            self.requested_item_name = self.item.name


class RequestAction(models.Model):
    request = models.ForeignKey(ItemRequest, on_delete=models.CASCADE, related_name='actions')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=40)
    from_status = models.CharField(max_length=30, blank=True)
    to_status = models.CharField(max_length=30, blank=True)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('created_at',)


class StockTransaction(models.Model):
    RECEIPT = 'receipt'
    ISSUE = 'issue'
    RETURN = 'return'
    ADJUSTMENT = 'adjustment'
    TYPE_CHOICES = [(RECEIPT, 'Receipt'), (ISSUE, 'Issue'), (RETURN, 'Return'), (ADJUSTMENT, 'Adjustment')]
    item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    reference_request = models.ForeignKey(ItemRequest, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

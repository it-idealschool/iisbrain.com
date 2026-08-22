import uuid
from django.db import migrations, models

ROLE_CHOICES = [
    ('COORDINATOR', 'Transport Coordinator'),
    ('DRIVER', 'Driver'),
    ('ATTENDANT', 'Bus Attendant / Conductor'),
]


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='TransportStaff',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('role', models.CharField(choices=ROLE_CHOICES, max_length=50)),
                ('contact_number', models.CharField(blank=True, max_length=100)),
                ('license_number', models.CharField(blank=True, max_length=100)),
                ('route', models.CharField(blank=True, max_length=100)),
                ('is_substitute', models.BooleanField(default=False)),
                ('doj', models.DateField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['role', 'name'],
                'verbose_name_plural': 'Transport staff',
            },
        ),
        migrations.CreateModel(
            name='TransportRoleRequirement',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('role', models.CharField(choices=ROLE_CHOICES, max_length=50, unique=True)),
                ('required_count', models.PositiveIntegerField(default=0)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['role'],
            },
        ),
        migrations.CreateModel(
            name='TransportSummary',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('number_of_buses', models.PositiveIntegerField(default=0)),
                ('students_per_bus', models.PositiveIntegerField(blank=True, null=True)),
                ('working_hours', models.CharField(blank=True, max_length=255)),
                ('overtime_notes', models.TextField(blank=True)),
                ('substitute_staff_availability', models.TextField(blank=True)),
                ('route_wise_staffing_notes', models.TextField(blank=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Transport summary',
            },
        ),
    ]

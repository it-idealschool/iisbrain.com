import uuid
from django.db import migrations, models

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


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='AdminStaff',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('position', models.CharField(choices=POSITION_CHOICES, max_length=50)),
                ('contact_number', models.CharField(blank=True, max_length=100)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('doj', models.DateField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['position', 'name'],
                'verbose_name_plural': 'Admin staff',
            },
        ),
        migrations.CreateModel(
            name='AdminPositionRequirement',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('position', models.CharField(choices=POSITION_CHOICES, max_length=50, unique=True)),
                ('required_count', models.PositiveIntegerField(default=0)),
                ('key_responsibilities', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['position'],
            },
        ),
    ]

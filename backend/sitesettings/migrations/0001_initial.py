# Generated for the RegistrationSettings singleton

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='RegistrationSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('teacher_registration_open', models.BooleanField(default=True)),
                ('admin_staff_registration_open', models.BooleanField(default=True)),
                ('transport_registration_open', models.BooleanField(default=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Registration settings',
                'verbose_name_plural': 'Registration settings',
            },
        ),
    ]

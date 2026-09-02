# Generated manually — simplifies the Qualifications section on TransportStaff
# and adds Bus Number.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transport', '0002_transportstaff_age_transportstaff_bed_details_and_more'),
    ]

    operations = [
        migrations.RemoveField(model_name='transportstaff', name='ug_qualification'),
        migrations.RemoveField(model_name='transportstaff', name='pg_qualification'),
        migrations.RemoveField(model_name='transportstaff', name='other_diploma'),
        migrations.RemoveField(model_name='transportstaff', name='bed_qualified'),
        migrations.RemoveField(model_name='transportstaff', name='bed_details'),
        migrations.RemoveField(model_name='transportstaff', name='med_qualified'),
        migrations.RemoveField(model_name='transportstaff', name='med_details'),
        migrations.RemoveField(model_name='transportstaff', name='phd_qualified'),
        migrations.AddField(
            model_name='transportstaff',
            name='bus_number',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='transportstaff',
            name='qualification',
            field=models.CharField(
                blank=True,
                choices=[
                    ('PLUS_TWO', '+2'),
                    ('DIPLOMA', 'Diploma'),
                    ('GRADUATED', 'Graduated'),
                    ('POST_GRADUATED', 'Post Graduated'),
                ],
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='transportstaff',
            name='extra_qualification',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='transportstaff',
            name='certificate_url',
            field=models.TextField(blank=True),
        ),
    ]

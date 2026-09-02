# Generated manually — simplifies the Qualifications section on AdminStaff
# and adds Qatar ID expiry.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_staff', '0002_adminstaff_age_adminstaff_bed_details_and_more'),
    ]

    operations = [
        migrations.RemoveField(model_name='adminstaff', name='ug_qualification'),
        migrations.RemoveField(model_name='adminstaff', name='pg_qualification'),
        migrations.RemoveField(model_name='adminstaff', name='other_diploma'),
        migrations.RemoveField(model_name='adminstaff', name='bed_qualified'),
        migrations.RemoveField(model_name='adminstaff', name='bed_details'),
        migrations.RemoveField(model_name='adminstaff', name='med_qualified'),
        migrations.RemoveField(model_name='adminstaff', name='med_details'),
        migrations.RemoveField(model_name='adminstaff', name='phd_qualified'),
        migrations.AddField(
            model_name='adminstaff',
            name='qatar_id_expiry',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='adminstaff',
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
            model_name='adminstaff',
            name='extra_qualification',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='adminstaff',
            name='certificate_url',
            field=models.TextField(blank=True),
        ),
    ]

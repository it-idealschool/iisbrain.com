from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subjects', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='subject',
            name='required_teachers',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]

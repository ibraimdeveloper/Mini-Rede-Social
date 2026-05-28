# Generated migration for last_logout_at field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_passwordresettoken'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='last_logout_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

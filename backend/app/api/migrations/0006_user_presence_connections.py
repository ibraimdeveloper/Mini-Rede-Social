from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_user_last_logout_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='presence_connections',
            field=models.PositiveIntegerField(default=0),
        ),
    ]

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_user_presence_connections'),
    ]

    operations = [
        migrations.DeleteModel(
            name='PasswordResetToken',
        ),
    ]

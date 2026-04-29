from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('skillsessions', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='session',
            name='meet_link',
            field=models.URLField(blank=True, default='', max_length=500),
        ),
    ]

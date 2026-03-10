from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0015_remove_fincategory_uq_fin_category_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='fintransaction',
            name='receipt_url',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]

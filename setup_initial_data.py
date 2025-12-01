import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maintenance_system.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import EmailConfiguration

def setup():
    # Create Superuser
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin')
        print("Superuser 'admin' created.")
    else:
        print("Superuser 'admin' already exists.")

    # Create Email Configs
    configs = [
        ('APPROVER_PROD', 'prod@example.com', 'Aprovador Produção'),
        ('APPROVER_MAINT', 'maint@example.com', 'Aprovador Manutenção'),
    ]

    for key, email, desc in configs:
        obj, created = EmailConfiguration.objects.get_or_create(
            key=key,
            defaults={'email': email, 'description': desc}
        )
        if created:
            print(f"Config created: {key} -> {email}")
        else:
            print(f"Config already exists: {key}")

if __name__ == '__main__':
    setup()

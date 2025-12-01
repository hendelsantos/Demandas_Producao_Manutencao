import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maintenance_system.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import UserProfile

def fix_admin():
    try:
        user = User.objects.get(username='admin')
        user.set_password('admin')
        user.save()
        print("Admin password set to 'admin'.")
    except User.DoesNotExist:
        user = User.objects.create_superuser('admin', 'admin@example.com', 'admin')
        print("Admin user created.")

    # Ensure profile exists
    if not hasattr(user, 'profile'):
        UserProfile.objects.create(user=user, role='MANAGER_MAINT', hmc='0000')
        print("Admin profile created with role MANAGER_MAINT.")
    else:
        print("Admin profile already exists.")

if __name__ == '__main__':
    fix_admin()

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maintenance_system.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import UserProfile

def create_user(username, password, role, hmc, first_name, last_name):
    if not User.objects.filter(username=username).exists():
        user = User.objects.create_user(username=username, password=password, email=f'{username}@example.com', first_name=first_name, last_name=last_name)
        UserProfile.objects.create(user=user, role=role, hmc=hmc)
        print(f"User '{username}' created with role '{role}'.")
    else:
        print(f"User '{username}' already exists.")

def setup_users():
    users = [
        ('solicitante', '123', 'REQUESTER', '1001', 'João', 'Solicitante'),
        ('sup_prod', '123', 'APPROVER_PROD', '2001', 'Maria', 'Produção'),
        ('sup_manut', '123', 'APPROVER_MAINT', '3001', 'Carlos', 'Manutenção'),
        ('gerente', '123', 'MANAGER_MAINT', '4001', 'Roberto', 'Gerente'),
        ('tecnico', '123', 'EXECUTOR', '5001', 'Pedro', 'Técnico'),
        ('eng_mec', '123', 'ENGINEER_MECH', '6001', 'Ana', 'Mecânica'),
        ('eng_elet', '123', 'ENGINEER_ELEC', '6002', 'Lucas', 'Elétrica'),
    ]

    for u in users:
        create_user(*u)

if __name__ == '__main__':
    setup_users()

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'maintenance_system.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import UserProfile

def create_user(username, email, first_name, last_name, role, hmc):
    if not User.objects.filter(username=username).exists():
        user = User.objects.create_user(username, email, 'password123')
        user.first_name = first_name
        user.last_name = last_name
        user.save()
        
        UserProfile.objects.create(user=user, role=role, hmc=hmc)
        print(f"Created user: {username} ({role})")
    else:
        print(f"User {username} already exists")

def populate():
    # Supervisors
    create_user('sup_prod', 'prod@example.com', 'Carlos', 'Produção', 'APPROVER_PROD', 'HMC001')
    create_user('sup_maint', 'maint@example.com', 'Roberto', 'Manutenção', 'APPROVER_MAINT', 'HMC002')
    create_user('gerente', 'manager@example.com', 'Ricardo', 'Gerente', 'MANAGER_MAINT', 'HMC003')

    # Executors (Technical)
    create_user('tec_hyd', 'hyd@example.com', 'João', 'Hidráulica', 'EXECUTOR', 'HMC004')
    create_user('tec_elec', 'elec@example.com', 'Pedro', 'Elétrica', 'EXECUTOR', 'HMC005')
    create_user('tec_mech', 'mech@example.com', 'Marcos', 'Mecânica', 'EXECUTOR', 'HMC006')
    create_user('tec_auto', 'auto@example.com', 'Lucas', 'Automação', 'EXECUTOR', 'HMC007')

    # Engineers
    create_user('eng_mech', 'eng_mech@example.com', 'Ana', 'Mecânica', 'ENGINEER_MECH', 'HMC008')
    create_user('eng_elec', 'eng_elec@example.com', 'Paulo', 'Elétrica', 'ENGINEER_ELEC', 'HMC009')

if __name__ == '__main__':
    populate()

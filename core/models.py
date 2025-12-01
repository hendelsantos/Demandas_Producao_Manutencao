from django.db import models
from django.contrib.auth.models import User

class EmailConfiguration(models.Model):
    KEY_CHOICES = [
        ('APPROVER_PROD', 'Supervisor Produção'),
        ('APPROVER_MAINT', 'Supervisor Manutenção'),
        ('MANAGER_MAINT', 'Gerente Manutenção'),
    ]
    key = models.CharField(max_length=50, choices=KEY_CHOICES, unique=True)
    email = models.EmailField()
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.get_key_display()} ({self.email})"

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('REQUESTER', 'Solicitante'),
        ('APPROVER_PROD', 'Supervisor Produção'),
        ('APPROVER_MAINT', 'Supervisor Manutenção'),
        ('MANAGER_MAINT', 'Gerente Manutenção'),
        ('EXECUTOR', 'Executante (Técnico)'),
        ('ENGINEER_MECH', 'Engenheiro Mecânico'),
        ('ENGINEER_ELEC', 'Engenheiro Elétrico'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    hmc = models.CharField(max_length=20, unique=True, verbose_name="HMC (Matrícula)")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='REQUESTER', verbose_name="Função/Cargo")

    def __str__(self):
        return f"{self.user.username} - {self.hmc} ({self.get_role_display()})"

class MaintenanceRequest(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Emitido'),
        ('WAITING_PROD', 'Aguardando Aprovação (Produção)'),
        ('WAITING_MAINT', 'Aguardando Aprovação (Manutenção)'),
        ('WAITING_MANAGER', 'Aguardando Gerente (Engenharia)'),
        ('IN_EXECUTION', 'Em Execução'),
        ('DONE', 'Concluído'),
        ('REJECTED', 'Rejeitado'),
    ]

    title = models.CharField(max_length=200)
    problem_description = models.TextField(verbose_name="Problema")
    process = models.CharField(max_length=100)
    equipment = models.CharField(max_length=100)
    
    # GUT Matrix
    gut_gravity = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    gut_urgency = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    gut_tendency = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    
    photo = models.ImageField(upload_to='requests/', blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    
    # New Workflow Fields
    TYPE_CHOICES = [
        ('TECHNICAL', 'Técnica'),
        ('ENGINEERING', 'Engenharia'),
    ]
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, blank=True, null=True, verbose_name="Tipo da Demanda")
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_requests', verbose_name="Responsável Atual")

    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Execution fields
    execution_description = models.TextField(blank=True, null=True)
    execution_photo = models.ImageField(upload_to='executions/', blank=True, null=True)
    pm04_order = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"#{self.id} - {self.title}"

class RequestHistory(models.Model):
    request = models.ForeignKey(MaintenanceRequest, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=50) # e.g., 'CREATED', 'APPROVED_PROD'
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    comment = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} on #{self.request.id} by {self.actor}"

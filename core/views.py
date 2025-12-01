from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from .models import MaintenanceRequest, EmailConfiguration, RequestHistory
from .serializers import MaintenanceRequestSerializer, EmailConfigurationSerializer, UserSerializer, RequestHistorySerializer

class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRequest.objects.all().order_by('-created_at')
    serializer_class = MaintenanceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # When created, status is OPEN. Notify Production Approver.
        instance = serializer.save(requester=self.request.user)
        self._send_notification('APPROVER_PROD', instance, 'Nova Pendência Criada')

    @action(detail=True, methods=['post'])
    def approve_production(self, request, pk=None):
        instance = self.get_object()
        if instance.status != 'OPEN':
             return Response({'error': 'Status inválido para aprovação de produção'}, status=status.HTTP_400_BAD_REQUEST)
        
        instance.status = 'WAITING_MAINT'
        instance.save()
        
        self._log_history(instance, 'APPROVED_PROD', request.user, request.data.get('comment', ''))
        self._send_notification('APPROVER_MAINT', instance, 'Pendência Aprovada pela Produção')
        
        return Response(self.get_serializer(instance).data)

    @action(detail=True, methods=['post'])
    def reject_production(self, request, pk=None):
        instance = self.get_object()
        instance.status = 'REJECTED'
        instance.save()
        
        self._log_history(instance, 'REJECTED_PROD', request.user, request.data.get('comment', ''))
        # Notify requester (could be implemented if we stored requester email)
        
        return Response(self.get_serializer(instance).data)

    @action(detail=True, methods=['post'])
    def approve_maintenance(self, request, pk=None):
        instance = self.get_object()
        if instance.status != 'WAITING_MAINT':
             return Response({'error': 'Status inválido para aprovação de manutenção'}, status=status.HTTP_400_BAD_REQUEST)
        
        request_type = request.data.get('type')
        if not request_type:
            return Response({'error': 'É necessário definir o tipo da demanda (Técnica ou Engenharia)'}, status=status.HTTP_400_BAD_REQUEST)
        
        instance.type = request_type

        if request_type == 'TECHNICAL':
            executor_id = request.data.get('executor_id')
            if not executor_id:
                return Response({'error': 'É necessário selecionar um executante para demandas técnicas'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                executor = User.objects.get(id=executor_id)
                instance.assigned_to = executor
                instance.status = 'IN_EXECUTION'
                instance.save()
                
                self._log_history(instance, 'APPROVED_MAINT_TECH', request.user, f"Atribuído a {executor.username}")
                # Notify Executor
                self._send_notification_to_user(executor, instance, 'Nova Demanda Técnica Atribuída')
            except User.DoesNotExist:
                return Response({'error': 'Executante não encontrado'}, status=status.HTTP_400_BAD_REQUEST)

        elif request_type == 'ENGINEERING':
            instance.status = 'WAITING_MANAGER'
            instance.save()
            
            self._log_history(instance, 'APPROVED_MAINT_ENG', request.user, 'Encaminhado para Gerência')
            self._send_notification('MANAGER_MAINT', instance, 'Nova Demanda de Engenharia para Aprovação')
        
        else:
            return Response({'error': 'Tipo de demanda inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(self.get_serializer(instance).data)

    @action(detail=True, methods=['post'])
    def approve_manager(self, request, pk=None):
        instance = self.get_object()
        if instance.status != 'WAITING_MANAGER':
             return Response({'error': 'Status inválido para aprovação da gerência'}, status=status.HTTP_400_BAD_REQUEST)
        
        engineer_id = request.data.get('engineer_id')
        if not engineer_id:
            return Response({'error': 'É necessário selecionar um engenheiro responsável'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            engineer = User.objects.get(id=engineer_id)
            instance.assigned_to = engineer
            instance.status = 'IN_EXECUTION'
            instance.save()
            
            self._log_history(instance, 'APPROVED_MANAGER', request.user, f"Atribuído a {engineer.username}")
            # Notify Engineer
            self._send_notification_to_user(engineer, instance, 'Nova Demanda de Engenharia Atribuída')
        except User.DoesNotExist:
            return Response({'error': 'Engenheiro não encontrado'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(self.get_serializer(instance).data)

    @action(detail=True, methods=['post'])
    def reject_maintenance(self, request, pk=None):
        instance = self.get_object()
        instance.status = 'REJECTED' # Or return to OPEN/WAITING_PROD based on business rule
        instance.save()
        
        self._log_history(instance, 'REJECTED_MAINT', request.user, request.data.get('comment', ''))
        
        return Response(self.get_serializer(instance).data)

    @action(detail=True, methods=['post'])
    def finish_execution(self, request, pk=None):
        instance = self.get_object()
        if instance.status != 'IN_EXECUTION':
             return Response({'error': 'Status inválido para finalizar execução'}, status=status.HTTP_400_BAD_REQUEST)
        
        instance.status = 'DONE'
        instance.execution_description = request.data.get('execution_description', '')
        instance.pm04_order = request.data.get('pm04_order', '')
        instance.save()
        
        self._log_history(instance, 'FINISHED', request.user, request.data.get('comment', ''))
        
        return Response(self.get_serializer(instance).data)

    def _log_history(self, request_obj, action, user, comment):
        RequestHistory.objects.create(
            request=request_obj,
            action=action,
            actor=user,
            comment=comment
        )

    def _send_notification(self, role_key, request_obj, subject):
        try:
            config = EmailConfiguration.objects.get(key=role_key)
            recipient = config.email
            message = f"Demanda #{request_obj.id} - {request_obj.title}\nStatus: {request_obj.get_status_display()}"
            send_mail(
                subject,
                message,
                'system@maintenance.com',
                [recipient],
                fail_silently=True,
            )
            print(f"Email enviado para {recipient}: {subject}")
        except EmailConfiguration.DoesNotExist:
            print(f"Configuração de email não encontrada para {role_key}")

    def _send_notification_to_user(self, user, request_obj, subject):
        if user.email:
            message = f"Olá {user.first_name},\n\nA demanda #{request_obj.id} - '{request_obj.title}' foi atribuída a você.\n\nStatus: {request_obj.get_status_display()}\n\nAcesse o sistema para mais detalhes."
            send_mail(
                subject,
                message,
                'system@maintenance.com',
                [user.email],
                fail_silently=True,
            )
            print(f"Email enviado para {user.email}: {subject}")
        else:
            print(f"Usuário {user.username} não possui email cadastrado.")

class EmailConfigurationViewSet(viewsets.ModelViewSet):
    queryset = EmailConfiguration.objects.all()
    serializer_class = EmailConfigurationSerializer
    permission_classes = [permissions.IsAdminUser]

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role', None)
        if role is not None:
            queryset = queryset.filter(profile__role=role)
        return queryset

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

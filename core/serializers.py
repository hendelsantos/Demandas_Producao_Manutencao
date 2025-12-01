from rest_framework import serializers
from django.contrib.auth.models import User
from .models import MaintenanceRequest, EmailConfiguration, RequestHistory

class UserSerializer(serializers.ModelSerializer):
    hmc = serializers.CharField(source='profile.hmc', read_only=True)
    role = serializers.CharField(source='profile.role', read_only=True)
    role_display = serializers.CharField(source='profile.get_role_display', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'hmc', 'role', 'role_display']

class EmailConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailConfiguration
        fields = '__all__'

class RequestHistorySerializer(serializers.ModelSerializer):
    actor_name = serializers.ReadOnlyField(source='actor.username')

    class Meta:
        model = RequestHistory
        fields = ['id', 'action', 'actor', 'actor_name', 'comment', 'timestamp']

class MaintenanceRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.ReadOnlyField(source='requester.username')
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.username')
    history = RequestHistorySerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = '__all__'
        read_only_fields = ['requester', 'status', 'created_at', 'updated_at', 'assigned_to', 'type']

    def create(self, validated_data):
        # Assign current user as requester
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['requester'] = request.user
        return super().create(validated_data)

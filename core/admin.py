from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import MaintenanceRequest, EmailConfiguration, RequestHistory, UserProfile

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Perfil (HMC/Função)'

class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_hmc', 'get_role', 'is_staff')
    
    def get_hmc(self, instance):
        return instance.profile.hmc if hasattr(instance, 'profile') else '-'
    get_hmc.short_description = 'HMC'

    def get_role(self, instance):
        return instance.profile.get_role_display() if hasattr(instance, 'profile') else '-'
    get_role.short_description = 'Função'

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
admin.site.register(MaintenanceRequest)
admin.site.register(EmailConfiguration)
admin.site.register(RequestHistory)

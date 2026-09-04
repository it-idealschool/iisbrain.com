from django.urls import path
from .views import RegistrationSettingsView

urlpatterns = [
    path('registration/', RegistrationSettingsView.as_view(), name='registration-settings'),
]

from rest_framework import generics, permissions

from .models import RegistrationSettings
from .serializers import RegistrationSettingsSerializer


class RegistrationSettingsView(generics.RetrieveUpdateAPIView):
    """GET /api/settings/registration/ -- anyone can read the current
    on/off state (the public registration pages need this without
    being logged in).
    PATCH/PUT -- only logged-in admins can change it.
    """
    serializer_class = RegistrationSettingsSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_object(self):
        return RegistrationSettings.load()

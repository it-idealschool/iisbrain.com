from rest_framework import viewsets, permissions, filters
from rest_framework.exceptions import PermissionDenied
from .models import TransportStaff, TransportRoleRequirement, TransportSummary
from .serializers import (
    TransportStaffSerializer,
    TransportRoleRequirementSerializer,
    TransportSummarySerializer,
)
from sitesettings.models import RegistrationSettings


class TransportStaffViewSet(viewsets.ModelViewSet):
    queryset = TransportStaff.objects.all()
    serializer_class = TransportStaffSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'contact_number', 'route', 'license_number']

    def get_permissions(self):
        # Public self-registration: anyone can submit a new transport staff
        # record (subject to the admin's on/off toggle, checked in create()).
        # Viewing/editing/deleting the list still requires login.
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            settings_row = RegistrationSettings.load()
            if not settings_row.transport_registration_open:
                raise PermissionDenied('Transport staff registration is currently closed.')
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(role=role)
        return qs


class TransportRoleRequirementViewSet(viewsets.ModelViewSet):
    queryset = TransportRoleRequirement.objects.all()
    serializer_class = TransportRoleRequirementSerializer
    permission_classes = [permissions.IsAuthenticated]


class TransportSummaryViewSet(viewsets.ModelViewSet):
    """
    Effectively a singleton: the frontend fetches the list, uses the first
    record if one exists, and creates one only when the list is empty.
    """
    queryset = TransportSummary.objects.all()
    serializer_class = TransportSummarySerializer
    permission_classes = [permissions.IsAuthenticated]

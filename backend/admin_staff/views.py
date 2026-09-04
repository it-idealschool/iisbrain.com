from rest_framework import viewsets, permissions, filters
from rest_framework.exceptions import PermissionDenied
from .models import AdminStaff, AdminPositionRequirement
from .serializers import AdminStaffSerializer, AdminPositionRequirementSerializer
from sitesettings.models import RegistrationSettings


class AdminStaffViewSet(viewsets.ModelViewSet):
    queryset = AdminStaff.objects.all()
    serializer_class = AdminStaffSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'contact_number', 'email', 'position']

    def get_permissions(self):
        # Public self-registration: anyone can submit a new admin staff
        # record (subject to the admin's on/off toggle, checked in create()).
        # Viewing/editing/deleting the list still requires login.
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            settings_row = RegistrationSettings.load()
            if not settings_row.admin_staff_registration_open:
                raise PermissionDenied('Admin staff registration is currently closed.')
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        qs = super().get_queryset()
        position = self.request.query_params.get('position')
        if position:
            qs = qs.filter(position=position)
        return qs


class AdminPositionRequirementViewSet(viewsets.ModelViewSet):
    queryset = AdminPositionRequirement.objects.all()
    serializer_class = AdminPositionRequirementSerializer
    permission_classes = [permissions.IsAuthenticated]

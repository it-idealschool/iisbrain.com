from rest_framework import viewsets, permissions, filters
from .models import AdminStaff, AdminPositionRequirement
from .serializers import AdminStaffSerializer, AdminPositionRequirementSerializer


class AdminStaffViewSet(viewsets.ModelViewSet):
    queryset = AdminStaff.objects.all()
    serializer_class = AdminStaffSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'contact_number', 'email', 'position']

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

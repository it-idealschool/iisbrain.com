from rest_framework import viewsets, permissions
from .models import Subject
from .serializers import SubjectSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # The public teacher self-registration form needs to read the
        # subject list (to build its Subject/Periods picker) without being
        # logged in. Creating/editing/deleting subjects stays admin-only.
        if self.action == 'list':
            return [permissions.AllowAny()]
        return super().get_permissions()
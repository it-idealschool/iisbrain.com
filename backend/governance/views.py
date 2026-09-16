from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import DocumentActivity, DocumentCategory, PolicyDocument
from .serializers import DocumentCategorySerializer, PolicyDocumentSerializer


class DocumentCategoryViewSet(viewsets.ModelViewSet):
    queryset = DocumentCategory.objects.all()
    serializer_class = DocumentCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class PolicyDocumentViewSet(viewsets.ModelViewSet):
    queryset = PolicyDocument.objects.select_related('category', 'created_by', 'approved_by').prefetch_related('activities')
    serializer_class = PolicyDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ('category', 'document_type', 'status')

    def perform_create(self, serializer):
        document = serializer.save(created_by=self.request.user)
        DocumentActivity.objects.create(document=document, actor=self.request.user, action='created')

    def perform_update(self, serializer):
        document = serializer.save()
        DocumentActivity.objects.create(document=document, actor=self.request.user, action='updated')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        roles = set(request.user.roles.values_list('name', flat=True))
        if not request.user.is_superuser and not roles.intersection({'super_admin', 'management', 'principal'}):
            return Response({'detail': 'You are not authorized to approve institutional documents.'}, status=403)
        document = self.get_object()
        document.status = PolicyDocument.APPROVED
        document.approved_by = request.user
        document.save(update_fields=('status', 'approved_by', 'updated_at'))
        DocumentActivity.objects.create(document=document, actor=request.user, action='approved', comment=request.data.get('comment', ''))
        return Response(self.get_serializer(document).data)

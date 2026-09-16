from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import AppraisalRecord, EmployeeProfile, HRAction, HRServiceRequest, LeaveRequest
from .serializers import AppraisalRecordSerializer, EmployeeProfileSerializer, HRServiceRequestSerializer, LeaveRequestSerializer


def roles(user):
    return set(user.roles.values_list('name', flat=True))


def authorized(user, *allowed):
    return user.is_superuser or bool(roles(user).intersection({'super_admin', 'management', *allowed}))


class EmployeeProfileViewSet(viewsets.ModelViewSet):
    queryset = EmployeeProfile.objects.select_related('user')
    serializer_class = EmployeeProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.select_related('employee', 'employee__user').prefetch_related('actions__actor')
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset if authorized(self.request.user, 'hr', 'principal', 'department_head') else queryset.filter(employee__user=self.request.user)

    def perform_create(self, serializer):
        leave = serializer.save()
        HRAction.objects.create(leave_request=leave, actor=self.request.user, action='submitted', to_status=leave.status)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave = self.get_object()
        transitions = {
            LeaveRequest.PENDING_HOS: (LeaveRequest.PENDING_HR, ('department_head',)),
            LeaveRequest.PENDING_HR: (LeaveRequest.PENDING_PRINCIPAL, ('hr',)),
            LeaveRequest.PENDING_PRINCIPAL: (LeaveRequest.APPROVED, ('principal',)),
        }
        if leave.status not in transitions:
            return Response({'detail': 'This leave request cannot be approved now.'}, status=400)
        target, allowed = transitions[leave.status]
        if not authorized(request.user, *allowed):
            return Response({'detail': 'You are not authorized for this approval stage.'}, status=403)
        previous = leave.status
        leave.status = target
        leave.save(update_fields=('status', 'updated_at'))
        HRAction.objects.create(leave_request=leave, actor=request.user, action='approved', from_status=previous, to_status=target, comment=request.data.get('comment', ''))
        return Response(self.get_serializer(leave).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if not authorized(request.user, 'department_head', 'hr', 'principal'):
            return Response({'detail': 'Not authorized.'}, status=403)
        leave = self.get_object(); previous = leave.status
        leave.status = LeaveRequest.REJECTED; leave.save(update_fields=('status', 'updated_at'))
        HRAction.objects.create(leave_request=leave, actor=request.user, action='rejected', from_status=previous, to_status=leave.status, comment=request.data.get('comment', ''))
        return Response(self.get_serializer(leave).data)


class HRServiceRequestViewSet(viewsets.ModelViewSet):
    queryset = HRServiceRequest.objects.select_related('employee', 'employee__user').prefetch_related('actions__actor')
    serializer_class = HRServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset if authorized(self.request.user, 'hr', 'principal') else queryset.filter(employee__user=self.request.user)

    def perform_create(self, serializer):
        service = serializer.save()
        HRAction.objects.create(service_request=service, actor=self.request.user, action='submitted', to_status=service.status)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        service = self.get_object()
        if service.status == HRServiceRequest.PENDING_HR:
            target, allowed = HRServiceRequest.PENDING_PRINCIPAL, ('hr',)
        elif service.status == HRServiceRequest.PENDING_PRINCIPAL:
            target, allowed = HRServiceRequest.COMPLETED, ('principal',)
        else:
            return Response({'detail': 'This request cannot be approved now.'}, status=400)
        if not authorized(request.user, *allowed):
            return Response({'detail': 'You are not authorized for this approval stage.'}, status=403)
        previous = service.status; service.status = target; service.save(update_fields=('status', 'updated_at'))
        HRAction.objects.create(service_request=service, actor=request.user, action='approved', from_status=previous, to_status=target, comment=request.data.get('comment', ''))
        return Response(self.get_serializer(service).data)


class AppraisalRecordViewSet(viewsets.ModelViewSet):
    queryset = AppraisalRecord.objects.select_related('employee', 'reviewer')
    serializer_class = AppraisalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset if authorized(self.request.user, 'hr', 'principal', 'department_head') else queryset.filter(employee__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)

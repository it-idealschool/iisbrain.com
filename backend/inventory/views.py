from decimal import Decimal
from django.db import transaction
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import InventoryItem, ItemCategory, ItemRequest, RequestAction, StockTransaction
from .serializers import InventoryItemSerializer, ItemCategorySerializer, ItemRequestSerializer, StockTransactionSerializer


def user_roles(user):
    return set(user.roles.values_list('name', flat=True))


def has_role(user, *allowed):
    return user.is_superuser or bool(user_roles(user).intersection({'super_admin', 'management', *allowed}))


class ItemCategoryViewSet(viewsets.ModelViewSet):
    queryset = ItemCategory.objects.all()
    serializer_class = ItemCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.select_related('category')
    serializer_class = InventoryItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class ItemRequestViewSet(viewsets.ModelViewSet):
    queryset = ItemRequest.objects.select_related('requester').prefetch_related('lines__item', 'actions__actor')
    serializer_class = ItemRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        roles = user_roles(self.request.user)
        elevated = {'super_admin', 'management', 'principal', 'hr', 'department_head', 'facility_manager', 'store_manager'}
        return queryset if roles.intersection(elevated) or self.request.user.is_superuser else queryset.filter(requester=self.request.user)

    def perform_create(self, serializer):
        request = serializer.save(requester=self.request.user)
        RequestAction.objects.create(request=request, actor=self.request.user, action='submitted', to_status=request.status)

    def _move(self, request, target_status, action_name):
        item_request = self.get_object()
        previous = item_request.status
        item_request.status = target_status
        item_request.save(update_fields=('status', 'updated_at'))
        RequestAction.objects.create(
            request=item_request, actor=request.user, action=action_name,
            from_status=previous, to_status=target_status, comment=request.data.get('comment', ''),
        )
        return Response(self.get_serializer(item_request).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        current = self.get_object().status
        required_roles = {
            ItemRequest.SUBMITTED: ('department_head',),
            ItemRequest.HOS_APPROVED: ('facility_manager',),
            ItemRequest.FACILITY_APPROVED: ('principal',),
        }
        if current in required_roles and not has_role(request.user, *required_roles[current]):
            return Response({'detail': 'You are not authorized to approve this workflow stage.'}, status=status.HTTP_403_FORBIDDEN)
        transitions = {
            ItemRequest.SUBMITTED: ItemRequest.HOS_APPROVED,
            ItemRequest.HOS_APPROVED: ItemRequest.FACILITY_APPROVED,
            ItemRequest.FACILITY_APPROVED: ItemRequest.PRINCIPAL_APPROVED,
        }
        if current not in transitions:
            return Response({'detail': 'This request cannot be approved at its current stage.'}, status=status.HTTP_400_BAD_REQUEST)
        return self._move(request, transitions[current], 'approved')

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if not has_role(request.user, 'department_head', 'facility_manager', 'principal'):
            return Response({'detail': 'You are not authorized to reject this request.'}, status=status.HTTP_403_FORBIDDEN)
        return self._move(request, ItemRequest.REJECTED, 'rejected')

    @action(detail=True, methods=['post'])
    def return_for_correction(self, request, pk=None):
        if not has_role(request.user, 'department_head', 'facility_manager', 'principal'):
            return Response({'detail': 'You are not authorized to return this request.'}, status=status.HTTP_403_FORBIDDEN)
        return self._move(request, ItemRequest.RETURNED, 'returned')

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def issue(self, request, pk=None):
        item_request = self.get_object()
        if not has_role(request.user, 'store_manager'):
            return Response({'detail': 'Only the store team can issue approved items.'}, status=status.HTTP_403_FORBIDDEN)
        if item_request.status != ItemRequest.PRINCIPAL_APPROVED:
            return Response({'detail': 'Principal approval is required before issue.'}, status=status.HTTP_400_BAD_REQUEST)
        for line in item_request.lines.select_related('item'):
            if not line.item:
                continue
            quantity = line.approved_quantity or line.quantity
            if line.item.stock_quantity < quantity:
                return Response({'detail': f'Insufficient stock for {line.item.name}.'}, status=status.HTTP_400_BAD_REQUEST)
            line.item.stock_quantity -= Decimal(quantity)
            line.item.save(update_fields=('stock_quantity', 'updated_at'))
            StockTransaction.objects.create(item=line.item, transaction_type=StockTransaction.ISSUE, quantity=quantity, reference_request=item_request, created_by=request.user)
        return self._move(request, ItemRequest.ISSUED, 'issued')


class StockTransactionViewSet(viewsets.ModelViewSet):
    queryset = StockTransaction.objects.select_related('item', 'created_by')
    serializer_class = StockTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        transaction_record = serializer.save(created_by=self.request.user)
        item = transaction_record.item
        if transaction_record.transaction_type in (StockTransaction.RECEIPT, StockTransaction.RETURN):
            item.stock_quantity += transaction_record.quantity
        elif transaction_record.transaction_type == StockTransaction.ISSUE:
            item.stock_quantity -= transaction_record.quantity
        else:
            item.stock_quantity = transaction_record.quantity
        item.save(update_fields=('stock_quantity', 'updated_at'))

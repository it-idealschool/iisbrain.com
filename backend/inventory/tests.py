from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import Role, UserRole
from .models import InventoryItem, ItemCategory, ItemRequest, ItemRequestLine


class InventoryModelTests(TestCase):
    def test_low_stock_and_request(self):
        user = get_user_model().objects.create_user(username='staff', password='test-pass-123')
        category = ItemCategory.objects.create(name='Stationery')
        item = InventoryItem.objects.create(category=category, sku='PEN-01', name='Blue Pen', stock_quantity=5, reorder_level=5)
        request = ItemRequest.objects.create(requester=user, department='Administration', purpose='Daily work')
        self.assertTrue(item.is_low_stock)
        self.assertEqual(request.status, ItemRequest.SUBMITTED)

    def test_request_follows_approval_chain_and_issues_stock(self):
        User = get_user_model()
        staff = User.objects.create_user(username='requester', password='test-pass-123')
        request = ItemRequest.objects.create(requester=staff, department='Administration', purpose='Office use')
        category = ItemCategory.objects.create(name='IT')
        item = InventoryItem.objects.create(category=category, sku='MSE-01', name='Mouse', stock_quantity=10, reorder_level=2)
        ItemRequestLine.objects.create(request=request, item=item, requested_item_name='Mouse', quantity=2)

        client = APIClient()
        for role_name, expected in [
            (Role.DEPARTMENT_HEAD, ItemRequest.HOS_APPROVED),
            (Role.FACILITY_MANAGER, ItemRequest.FACILITY_APPROVED),
            (Role.PRINCIPAL, ItemRequest.PRINCIPAL_APPROVED),
        ]:
            approver = User.objects.create_user(username=role_name, password='test-pass-123')
            role, _ = Role.objects.get_or_create(name=role_name)
            UserRole.objects.create(user=approver, role=role)
            client.force_authenticate(approver)
            response = client.post(f'/api/inventory/requests/{request.id}/approve/', {}, format='json')
            self.assertEqual(response.status_code, 200)
            request.refresh_from_db()
            self.assertEqual(request.status, expected)

        store_user = User.objects.create_user(username='store', password='test-pass-123')
        store_role, _ = Role.objects.get_or_create(name=Role.STORE_MANAGER)
        UserRole.objects.create(user=store_user, role=store_role)
        client.force_authenticate(store_user)
        response = client.post(f'/api/inventory/requests/{request.id}/issue/', {}, format='json')
        self.assertEqual(response.status_code, 200)
        item.refresh_from_db()
        self.assertEqual(item.stock_quantity, 8)

from rest_framework.routers import DefaultRouter
from .views import InventoryItemViewSet, ItemCategoryViewSet, ItemRequestViewSet, StockTransactionViewSet

router = DefaultRouter()
router.register('categories', ItemCategoryViewSet)
router.register('items', InventoryItemViewSet)
router.register('requests', ItemRequestViewSet)
router.register('transactions', StockTransactionViewSet)
urlpatterns = router.urls

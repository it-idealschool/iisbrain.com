from rest_framework.routers import DefaultRouter
from .views import DocumentCategoryViewSet, PolicyDocumentViewSet

router = DefaultRouter()
router.register('categories', DocumentCategoryViewSet)
router.register('documents', PolicyDocumentViewSet)
urlpatterns = router.urls

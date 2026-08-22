from rest_framework.routers import DefaultRouter
from .views import AdminStaffViewSet, AdminPositionRequirementViewSet

router = DefaultRouter()
router.register('staff', AdminStaffViewSet, basename='admin-staff-member')
router.register('requirements', AdminPositionRequirementViewSet, basename='admin-position-requirement')

urlpatterns = router.urls

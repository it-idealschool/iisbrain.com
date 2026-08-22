from rest_framework.routers import DefaultRouter
from .views import (
    TransportStaffViewSet,
    TransportRoleRequirementViewSet,
    TransportSummaryViewSet,
)

router = DefaultRouter()
router.register('staff', TransportStaffViewSet, basename='transport-staff-member')
router.register('requirements', TransportRoleRequirementViewSet, basename='transport-role-requirement')
router.register('summary', TransportSummaryViewSet, basename='transport-summary')

urlpatterns = router.urls

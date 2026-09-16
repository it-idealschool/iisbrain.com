from rest_framework.routers import DefaultRouter
from .views import AppraisalRecordViewSet, EmployeeProfileViewSet, HRServiceRequestViewSet, LeaveRequestViewSet

router = DefaultRouter()
router.register('employees', EmployeeProfileViewSet)
router.register('leave-requests', LeaveRequestViewSet)
router.register('service-requests', HRServiceRequestViewSet)
router.register('appraisals', AppraisalRecordViewSet)
urlpatterns = router.urls

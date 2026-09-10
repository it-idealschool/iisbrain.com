from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AcademicYearViewSet,
    GradeDivisionViewSet,
    SubjectGradeRequirementViewSet,
    ManpowerSettingsView,
    OverviewAnalyticsView,
    StudentGradeAnalyticsView,
    ClassCapacityAnalyticsView,
)

router = DefaultRouter()
router.register('academic-years', AcademicYearViewSet, basename='academic-year')
router.register('grade-divisions', GradeDivisionViewSet, basename='grade-division')
router.register('subject-grade-requirements', SubjectGradeRequirementViewSet, basename='subject-grade-requirement')

urlpatterns = [
    path('settings/', ManpowerSettingsView.as_view(), name='analytics-settings'),
    path('overview/', OverviewAnalyticsView.as_view(), name='analytics-overview'),
    path('students/', StudentGradeAnalyticsView.as_view(), name='analytics-students'),
    path('class-capacity/', ClassCapacityAnalyticsView.as_view(), name='analytics-class-capacity'),
] + router.urls

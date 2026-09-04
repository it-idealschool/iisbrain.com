from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/subjects/', include('subjects.urls')),
    path('api/teachers/', include('teachers.urls')),
    path('api/students/', include('students.urls')),
    path('api/admin-staff/', include('admin_staff.urls')),
    path('api/transport/', include('transport.urls')),
    path('api/settings/', include('sitesettings.urls')),
]

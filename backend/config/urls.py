from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/users/', include('apps.users.user_urls')),
    path('api/skills/', include('apps.skills.urls')),
    path('api/matches/', include('apps.matches.urls')),
    path('api/messages/', include('apps.messages.urls')),
    path('api/sessions/', include('apps.sessions.urls')),
    path('api/feedback/', include('apps.feedback.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

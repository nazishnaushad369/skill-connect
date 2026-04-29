from django.urls import path
from .views import UserListView, UserDetailView, AdminStatsView

# admin/stats/ MUST come before <int:pk>/ to avoid Django trying to match
# the string 'admin' as an integer pk (which throws a ValueError/404)
urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]

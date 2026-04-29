from django.urls import path
from .views import SessionListView, SessionCreateView, SessionUpdateView, AllSessionsView

urlpatterns = [
    path('', SessionListView.as_view(), name='session-list'),
    path('create/', SessionCreateView.as_view(), name='session-create'),
    path('<int:pk>/', SessionUpdateView.as_view(), name='session-detail'),
    path('all/', AllSessionsView.as_view(), name='all-sessions'),
]

from django.urls import path
from .views import ThreadListView, MessageThreadView, SendMessageView

urlpatterns = [
    path('threads/', ThreadListView.as_view(), name='thread-list'),
    path('<int:user_id>/', MessageThreadView.as_view(), name='message-thread'),
    path('send/', SendMessageView.as_view(), name='send-message'),
]

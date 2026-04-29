from django.urls import path
from .views import FeedbackListView, FeedbackCreateView, UserFeedbackView, PublicTestimonialsView

urlpatterns = [
    path('', FeedbackListView.as_view(), name='feedback-list'),
    path('create/', FeedbackCreateView.as_view(), name='feedback-create'),
    path('user/<int:user_id>/', UserFeedbackView.as_view(), name='user-feedback'),
    path('public-testimonials/', PublicTestimonialsView.as_view(), name='public-testimonials'),
]

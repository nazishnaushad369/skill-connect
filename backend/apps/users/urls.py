from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, MeView, PingView, PublicStatsView,
    ForgotPasswordView, ResetPasswordView,
)
from .subscription_views import SubscriptionStatusView, ActivateSubscriptionView

urlpatterns = [
    path('register/',        RegisterView.as_view(),           name='register'),
    path('login/',           LoginView.as_view(),              name='login'),
    path('refresh/',         TokenRefreshView.as_view(),       name='token_refresh'),
    path('me/',              MeView.as_view(),                 name='me'),
    path('ping/',            PingView.as_view(),               name='ping'),
    path('public-stats/',    PublicStatsView.as_view(),        name='public-stats'),
    path('forgot-password/', ForgotPasswordView.as_view(),     name='forgot-password'),
    path('reset-password/',  ResetPasswordView.as_view(),      name='reset-password'),
    path('subscription/',    SubscriptionStatusView.as_view(), name='subscription-status'),
    path('subscribe/',       ActivateSubscriptionView.as_view(), name='subscribe'),
]

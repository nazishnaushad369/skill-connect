from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta

User = get_user_model()

PLANS = {
    'monthly': {'name': 'Pro Monthly', 'price': 99,  'duration_days': 30},
    'yearly':  {'name': 'Pro Yearly',  'price': 999, 'duration_days': 365},
}


def expire_if_needed(user):
    """
    If the user's subscription has passed its expiry date, revoke premium.
    Returns True if premium was revoked, False otherwise.
    """
    if user.is_premium and user.premium_expires_at and timezone.now() > user.premium_expires_at:
        user.is_premium = False
        user.save(update_fields=['is_premium'])
        return True
    return False


class SubscriptionStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        expire_if_needed(user)
        return Response({
            'is_premium':       user.is_premium,
            'premium_since':    user.premium_since,
            'premium_expires_at': user.premium_expires_at,
            'is_active':        user.is_premium_active,
        })


class ActivateSubscriptionView(APIView):
    """
    Simulated payment activation endpoint.
    In production this would verify a real payment gateway webhook.
    For demo purposes, calling POST here immediately grants premium.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan = request.data.get('plan', 'monthly')
        if plan not in PLANS:
            return Response({'detail': 'Invalid plan.'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        plan_info = PLANS[plan]
        now = timezone.now()

        user.is_premium = True
        user.premium_since = now
        user.premium_expires_at = now + timedelta(days=plan_info['duration_days'])
        user.save(update_fields=['is_premium', 'premium_since', 'premium_expires_at'])

        return Response({
            'success': True,
            'is_premium': True,
            'plan': plan_info['name'],
            'expires_at': user.premium_expires_at.isoformat(),
            'message': f'Welcome to SkillConnect Pro! Your {plan_info["name"]} is active.',
        })

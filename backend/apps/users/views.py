from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from .serializers import RegisterSerializer, UserProfileSerializer, UserListSerializer

User = get_user_model()


class PublicStatsView(APIView):
    """Public endpoint — no auth required. Used by the landing page stats section."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from apps.sessions.models import Session
        from apps.skills.models import Skill
        return Response({
            'total_users': User.objects.filter(is_active=True).count(),
            'total_skills': Skill.objects.count(),
            'completed_sessions': Session.objects.filter(status='completed').count(),
        })


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        # Check for duplicate email with a clear error message
        email = request.data.get('email', '').strip().lower()
        if email and User.objects.filter(email__iexact=email).exists():
            return Response(
                {'email': ['An account with this email already exists. Please log in.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(user, context={'request': request}).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # authenticate uses USERNAME_FIELD='email' via ModelBackend
        user = authenticate(request, username=email, password=password)

        if not user:
            return Response(
                {'detail': 'Invalid email or password. Please try again.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {'detail': 'Account is deactivated. Contact support.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(user, context={'request': request}).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        from .subscription_views import expire_if_needed
        user = self.request.user
        expire_if_needed(user)  # auto-revoke if subscription expired
        return user


class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '')
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(email__icontains=search)
        return qs


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from apps.sessions.models import Session
        from apps.skills.models import Skill
        return Response({
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'total_skills': Skill.objects.count(),
            'total_sessions': Session.objects.count(),
            'scheduled_sessions': Session.objects.filter(status='scheduled').count(),
            'completed_sessions': Session.objects.filter(status='completed').count(),
        })


class PingView(APIView):
    """Heartbeat endpoint — call every 60s to mark user as online."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from django.utils import timezone
        request.user.last_seen = timezone.now()
        request.user.save(update_fields=['last_seen'])
        return Response({'status': 'ok'})


class ForgotPasswordView(APIView):
    """Send a password-reset email. Always returns 200 (security best practice)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        from django.core.mail import send_mail
        from django.conf import settings

        email = request.data.get('email', '').strip().lower()
        try:
            user = User.objects.get(email__iexact=email, is_active=True)
            uid   = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

            send_mail(
                subject='Reset your SkillConnect password',
                message=f"""Hi {user.name},

You requested a password reset for your SkillConnect account.

Click the link below to set a new password (valid for 24 hours):

{reset_url}

If you did not request this, you can safely ignore this email.

— The SkillConnect Team
""",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except User.DoesNotExist:
            pass  # Don't reveal if email exists

        # Always return success so attackers can't enumerate emails
        return Response({'detail': 'If an account exists, a reset link has been sent.'})


class ResetPasswordView(APIView):
    """Validate token and set the new password."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_decode
        from django.utils.encoding import force_str

        uid      = request.data.get('uid', '')
        token    = request.data.get('token', '')
        password = request.data.get('password', '')

        if not uid or not token or not password:
            return Response({'detail': 'uid, token and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 6:
            return Response({'detail': 'Password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_pk = force_str(urlsafe_base64_decode(uid))
            user    = User.objects.get(pk=user_pk, is_active=True)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({'detail': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'Reset link has expired or is invalid. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()
        return Response({'detail': 'Password updated successfully. You can now log in.'})


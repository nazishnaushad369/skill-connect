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

            html_message = f"""
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0;">
  <div style="background: linear-gradient(135deg, #6366F1, #8B5CF6); padding: 36px 40px; text-align: center;">
    <div style="display: inline-flex; align-items: center; gap: 10px;">
      <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center;">
        <span style="font-size: 20px;">⚡</span>
      </div>
      <span style="font-size: 24px; font-weight: 900; color: white; letter-spacing: -0.5px;">Skill<span style="opacity:0.85">Connect</span></span>
    </div>
  </div>
  <div style="padding: 40px;">
    <h1 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 8px;">Reset Your Password 🔐</h1>
    <p style="color: #64748B; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
      Hi <strong style="color: #0F172A;">{user.name}</strong>,<br><br>
      We received a request to reset your SkillConnect password. Click the button below to create a new password. This link is valid for <strong>24 hours</strong>.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="{reset_url}" style="display: inline-block; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-weight: 700; font-size: 15px; letter-spacing: 0.2px; box-shadow: 0 4px 16px rgba(99,102,241,0.35);">
        Reset My Password →
      </a>
    </div>
    <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin: 28px 0 0;">
      If you didn't request this, you can safely ignore this email. Your password will remain unchanged.<br><br>
      Or copy this link: <a href="{reset_url}" style="color: #6366F1; word-break: break-all;">{reset_url}</a>
    </p>
  </div>
  <div style="background: #F8FAFC; padding: 20px 40px; text-align: center; border-top: 1px solid #E2E8F0;">
    <p style="color: #94A3B8; font-size: 12px; margin: 0;">© 2025 SkillConnect. Exchange Skills. Unlock Your Potential.</p>
  </div>
</div>
"""
            try:
                from django.core.mail import EmailMultiAlternatives
                msg = EmailMultiAlternatives(
                    subject='Reset your SkillConnect password',
                    body=f"Hi {user.name},\n\nReset your password here: {reset_url}\n\nThis link expires in 24 hours.\n\n— SkillConnect Team",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[user.email],
                )
                msg.attach_alternative(html_message, "text/html")
                msg.send()
                print(f"[SkillConnect] ✅ Password reset email sent to {user.email}")
            except Exception as email_error:
                print(f"[SkillConnect] ❌ Email error: {email_error}")

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


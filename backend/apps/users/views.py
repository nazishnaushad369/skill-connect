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
    """Send a real password-reset email via Brevo SMTP."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings

        email = request.data.get('email', '').strip().lower()
        phone = request.data.get('phone', '').strip()

        # Look up user by email OR phone number
        user = None
        try:
            if email:
                user = User.objects.get(email__iexact=email, is_active=True)
            elif phone:
                # Strip spaces/dashes for flexible matching
                clean_phone = phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
                user = User.objects.filter(is_active=True).extra(
                    where=["REPLACE(REPLACE(REPLACE(REPLACE(phone,'(',''),')',''),'-',''),' ','') = %s"],
                    params=[clean_phone]
                ).first()
                if not user:
                    return Response({'detail': 'If an account exists, a reset link has been sent.'})
        except User.DoesNotExist:
            return Response({'detail': 'If an account exists, a reset link has been sent.'})

        if not user:
            return Response({'detail': 'If an account exists, a reset link has been sent.'})


        uid       = urlsafe_base64_encode(force_bytes(user.pk))
        token     = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
        name      = user.name

        text_body = (
            f"Hi {name},\n\n"
            f"Reset your SkillConnect password here:\n{reset_url}\n\n"
            "This link expires in 24 hours.\n\n— SkillConnect Team"
        )

        html_parts = [
            '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;',
            'background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E2E8F0;">',
            '<div style="background:linear-gradient(135deg,#6366F1,#8B5CF6);',
            'padding:36px 40px;text-align:center;">',
            '<span style="font-size:26px;font-weight:900;color:#fff;">&#9889; SkillConnect</span>',
            '</div>',
            '<div style="padding:40px;">',
            f'<h2 style="font-size:22px;color:#0F172A;margin:0 0 12px;">Hi {name}!</h2>',
            '<p style="color:#64748B;font-size:15px;line-height:1.7;margin:0 0 28px;">',
            'We received a request to reset your SkillConnect password.<br>',
            'Click the button below &mdash; link valid for <strong>24 hours</strong>.</p>',
            '<div style="text-align:center;margin:28px 0;">',
            f'<a href="{reset_url}" style="background:linear-gradient(135deg,#6366F1,#8B5CF6);',
            'color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;',
            'font-weight:700;font-size:15px;display:inline-block;">Reset My Password &rarr;</a>',
            '</div>',
            '<p style="color:#94A3B8;font-size:13px;line-height:1.6;">',
            "Didn't request this? You can safely ignore this email.<br>",
            f'Or paste this link: <a href="{reset_url}" style="color:#6366F1;">{reset_url}</a></p>',
            '</div>',
            '<div style="background:#F8FAFC;padding:18px 40px;text-align:center;',
            'border-top:1px solid #E2E8F0;">',
            '<p style="color:#94A3B8;font-size:12px;margin:0;">&copy; 2025 SkillConnect</p>',
            '</div></div>',
        ]
        html_body = ''.join(html_parts)

        try:
            msg = EmailMultiAlternatives(
                subject='Reset your SkillConnect password',
                body=text_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
            )
            msg.attach_alternative(html_body, 'text/html')
            msg.send()
            print(f"[SkillConnect] Email sent to {user.email}")
        except Exception as err:
            print(f"[SkillConnect] Email error: {err}")

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


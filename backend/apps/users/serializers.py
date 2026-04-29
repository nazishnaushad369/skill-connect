from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


def _can_view_email(viewer, target):
    """Return True if the viewer is allowed to see the target user's email."""
    if viewer is None or not viewer.is_authenticated:
        return False
    # Always show own email
    if viewer.id == target.id:
        return True
    # Admins and staff can always see emails
    if viewer.role == 'admin' or viewer.is_staff:
        return True
    # Premium users can see emails
    if viewer.is_premium_active:
        return True
    # Free users cannot see other users' emails
    return False


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'bio', 'role']
        extra_kwargs = {'role': {'read_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            bio=validated_data.get('bio', ''),
        )


class UserProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    is_online  = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'bio', 'role', 'avatar', 'avatar_url',
                  'is_premium', 'premium_since', 'premium_expires_at', 'created_at',
                  'last_seen', 'is_online']
        extra_kwargs = {'avatar': {'write_only': True}}

    def get_is_online(self, obj):
        return obj.is_online

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        viewer = getattr(request, 'user', None)
        if not _can_view_email(viewer, instance):
            data['email'] = None
        return data


class UserListSerializer(serializers.ModelSerializer):
    avatar_url  = serializers.SerializerMethodField()
    skill_count = serializers.SerializerMethodField()
    is_online   = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'bio', 'role', 'avatar_url', 'skill_count',
                  'created_at', 'last_seen', 'is_online']

    def get_is_online(self, obj):
        return obj.is_online

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None

    def get_skill_count(self, obj):
        return obj.skills.count()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        viewer = getattr(request, 'user', None)
        if not _can_view_email(viewer, instance):
            data['email'] = None
        return data

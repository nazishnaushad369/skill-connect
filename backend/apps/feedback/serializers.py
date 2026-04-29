from rest_framework import serializers
from .models import Feedback
from apps.users.serializers import UserListSerializer


class FeedbackSerializer(serializers.ModelSerializer):
    reviewer_detail = UserListSerializer(source='reviewer', read_only=True)
    reviewee_detail = UserListSerializer(source='reviewee', read_only=True)

    class Meta:
        model = Feedback
        fields = ['id', 'session', 'reviewer', 'reviewee', 'reviewer_detail', 'reviewee_detail', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'reviewer', 'created_at']
        extra_kwargs = {
            'session': {'required': False, 'allow_null': True},
        }

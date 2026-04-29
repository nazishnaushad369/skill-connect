from rest_framework import serializers
from .models import Session
from apps.users.serializers import UserListSerializer


class SessionSerializer(serializers.ModelSerializer):
    user1_detail = UserListSerializer(source='user1', read_only=True)
    user2_detail = UserListSerializer(source='user2', read_only=True)

    class Meta:
        model = Session
        fields = ['id', 'user1', 'user2', 'user1_detail', 'user2_detail', 'title', 'date', 'time', 'status', 'notes', 'meet_link', 'created_at']
        read_only_fields = ['id', 'user1', 'created_at']
        extra_kwargs = {
            'user2': {'write_only': False},
        }

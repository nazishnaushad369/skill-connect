from rest_framework import serializers
from .models import Match
from apps.users.serializers import UserListSerializer


class MatchSerializer(serializers.ModelSerializer):
    user1_detail = UserListSerializer(source='user1', read_only=True)
    user2_detail = UserListSerializer(source='user2', read_only=True)

    class Meta:
        model = Match
        fields = ['id', 'user1', 'user2', 'user1_detail', 'user2_detail', 'matched_skill', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

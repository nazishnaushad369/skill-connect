from rest_framework import serializers
from .models import Message
from apps.users.serializers import UserListSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender_detail = UserListSerializer(source='sender', read_only=True)
    receiver_detail = UserListSerializer(source='receiver', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'sender_detail', 'receiver_detail', 'content', 'is_read', 'timestamp']
        read_only_fields = ['id', 'sender', 'timestamp', 'is_read']


class ThreadSerializer(serializers.Serializer):
    user = UserListSerializer()
    last_message = serializers.CharField()
    timestamp = serializers.DateTimeField()
    unread_count = serializers.IntegerField()

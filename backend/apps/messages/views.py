from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Max
from django.contrib.auth import get_user_model
from .models import Message
from .serializers import MessageSerializer
from apps.users.serializers import _can_view_email

User = get_user_model()


class ThreadListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # Get all users this user has messaged with
        sent_to = Message.objects.filter(sender=user).values_list('receiver', flat=True)
        received_from = Message.objects.filter(receiver=user).values_list('sender', flat=True)
        partner_ids = set(list(sent_to) + list(received_from))

        threads = []
        for partner_id in partner_ids:
            try:
                partner = User.objects.get(id=partner_id)
                last_msg = Message.objects.filter(
                    Q(sender=user, receiver=partner) | Q(sender=partner, receiver=user)
                ).order_by('-timestamp').first()
                unread = Message.objects.filter(sender=partner, receiver=user, is_read=False).count()
                if last_msg:
                    threads.append({
                        'user': {
                            'id': partner.id,
                            'name': partner.name,
                            'email': partner.email if _can_view_email(user, partner) else None,
                            'bio': partner.bio,
                        },
                        'last_message': last_msg.content,
                        'timestamp': last_msg.timestamp,
                        'unread_count': unread,
                    })
            except User.DoesNotExist:
                continue

        threads.sort(key=lambda x: x['timestamp'], reverse=True)
        return Response(threads)


class MessageThreadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        try:
            other_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        messages = Message.objects.filter(
            Q(sender=request.user, receiver=other_user) |
            Q(sender=other_user, receiver=request.user)
        ).order_by('timestamp')

        # Mark as read
        messages.filter(sender=other_user, receiver=request.user).update(is_read=True)

        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)


class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

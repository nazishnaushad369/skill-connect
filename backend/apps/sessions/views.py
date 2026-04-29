from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Session
from .serializers import SessionSerializer


class SessionListView(generics.ListAPIView):
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Session.objects.filter(Q(user1=user) | Q(user2=user)).select_related('user1', 'user2')
        status_filter = self.request.query_params.get('status', '')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by('date', 'time')


class SessionCreateView(generics.CreateAPIView):
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user1=self.request.user)


class SessionUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Session.objects.filter(Q(user1=user) | Q(user2=user))

    def get_serializer(self, *args, **kwargs):
        # Always allow partial updates (PATCH)
        kwargs.setdefault('partial', True)
        return super().get_serializer(*args, **kwargs)


class AllSessionsView(generics.ListAPIView):
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Session.objects.all().order_by('-created_at')

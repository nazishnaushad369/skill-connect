from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Match
from .serializers import MatchSerializer
from apps.skills.models import Skill
from apps.users.serializers import _can_view_email
from django.contrib.auth import get_user_model

User = get_user_model()


class MatchListView(generics.ListAPIView):
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Match.objects.filter(Q(user1=user) | Q(user2=user)).select_related('user1', 'user2').order_by('-created_at')


class MatchSuggestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        my_teach = set(Skill.objects.filter(user=user, skill_type='teach').values_list('skill_name', flat=True))
        my_learn = set(Skill.objects.filter(user=user, skill_type='learn').values_list('skill_name', flat=True))

        suggestions = []
        other_users = User.objects.exclude(id=user.id).prefetch_related('skills')

        for other in other_users:
            their_teach = set(other.skills.filter(skill_type='teach').values_list('skill_name', flat=True))
            their_learn = set(other.skills.filter(skill_type='learn').values_list('skill_name', flat=True))

            # They teach what I want to learn
            they_teach_me = my_learn & their_teach
            # I teach what they want to learn
            i_teach_them = my_teach & their_learn

            if they_teach_me or i_teach_them:
                suggestions.append({
                    'user': {
                        'id': other.id,
                        'name': other.name,
                        'email': other.email if _can_view_email(user, other) else None,
                        'bio': other.bio,
                    },
                    'they_can_teach_you': list(they_teach_me),
                    'you_can_teach_them': list(i_teach_them),
                    'match_score': len(they_teach_me) + len(i_teach_them),
                })

        suggestions.sort(key=lambda x: x['match_score'], reverse=True)
        return Response(suggestions[:20])


class MatchCreateView(generics.CreateAPIView):
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user1=self.request.user)


class MatchAcceptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            match = Match.objects.get(pk=pk, user2=request.user)
            match.status = 'accepted'
            match.save()
            return Response(MatchSerializer(match).data)
        except Match.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg
from .models import Feedback
from .serializers import FeedbackSerializer


class FeedbackListView(generics.ListAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Feedback.objects.filter(reviewer=self.request.user).select_related('reviewer', 'reviewee', 'session')


class FeedbackCreateView(generics.CreateAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)


class UserFeedbackView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        feedbacks = Feedback.objects.filter(reviewee_id=user_id).select_related('reviewer', 'session')
        avg = feedbacks.aggregate(avg=Avg('rating'))['avg'] or 0
        serializer = FeedbackSerializer(feedbacks, many=True, context={'request': request})
        return Response({
            'average_rating': round(avg, 1),
            'total_reviews': feedbacks.count(),
            'reviews': serializer.data,
        })


# Deterministic color palette for avatar initials
_COLORS = ['#6366F1', '#8B5CF6', '#0EA5E9', '#EC4899', '#10B981', '#F59E0B']


def _avatar_color(user_id):
    return _COLORS[user_id % len(_COLORS)]


class PublicTestimonialsView(APIView):
    """Public endpoint — no auth required. Returns up to 3 recent high-rated reviews for the landing page."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        feedbacks = (
            Feedback.objects
            .filter(rating__gte=4, comment__gt='')
            .select_related('reviewer', 'reviewee', 'session')
            .order_by('-created_at')[:6]
        )

        results = []
        for fb in feedbacks:
            reviewer = fb.reviewer
            # Build a short "role" string from the reviewer's skills
            skills = list(reviewer.skills.values_list('name', flat=True)[:2])
            role = ' & '.join(skills) if skills else 'SkillConnect Member'

            # Avatar URL (uploaded photo) or None (frontend shows initials)
            avatar_url = None
            if reviewer.avatar:
                try:
                    avatar_url = request.build_absolute_uri(reviewer.avatar.url)
                except Exception:
                    pass

            results.append({
                'name':         reviewer.name,
                'role':         role,
                'text':         fb.comment,
                'rating':       fb.rating,
                'avatar_url':   avatar_url,
                'avatar_color': _avatar_color(reviewer.id),
            })

        return Response(results[:3])

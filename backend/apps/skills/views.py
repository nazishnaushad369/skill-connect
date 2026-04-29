from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Skill
from .serializers import SkillSerializer


class SkillListCreateView(generics.ListCreateAPIView):
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Skill.objects.select_related('user').all()
        skill_type = self.request.query_params.get('type', '')
        category = self.request.query_params.get('category', '')
        search = self.request.query_params.get('search', '')
        user_id = self.request.query_params.get('user', '')

        if skill_type:
            qs = qs.filter(skill_type=skill_type)
        if category:
            qs = qs.filter(category__icontains=category)
        if search:
            qs = qs.filter(Q(skill_name__icontains=search) | Q(category__icontains=search))
        if user_id:
            try:
                qs = qs.filter(user_id=int(user_id))
            except (ValueError, TypeError):
                pass
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)


class MySkillsView(generics.ListAPIView):
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user).order_by('-created_at')


class CategoryListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        categories = Skill.objects.values_list('category', flat=True).distinct()
        return Response(sorted(set(filter(None, categories))))

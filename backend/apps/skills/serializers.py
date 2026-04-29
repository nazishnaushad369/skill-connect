from rest_framework import serializers
from .models import Skill


class SkillSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.name')
    user_id = serializers.ReadOnlyField(source='user.id')

    class Meta:
        model = Skill
        fields = ['id', 'user_id', 'user_name', 'skill_name', 'category', 'description', 'skill_type', 'created_at']
        read_only_fields = ['id', 'user_id', 'user_name', 'created_at']

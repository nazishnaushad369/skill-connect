from django.db import models
from django.conf import settings


class Skill(models.Model):
    TYPE_CHOICES = [('teach', 'Teach'), ('learn', 'Learn')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skills')
    skill_name = models.CharField(max_length=100)
    category = models.CharField(max_length=100, blank=True, default='General')
    description = models.TextField(blank=True, default='')
    skill_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.skill_name} ({self.skill_type}) - {self.user.name}"

    class Meta:
        app_label = 'skills'

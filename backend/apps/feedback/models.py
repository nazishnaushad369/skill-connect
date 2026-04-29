from django.db import models
from django.conf import settings
from apps.sessions.models import Session


class Feedback(models.Model):
    session = models.ForeignKey(Session, on_delete=models.SET_NULL, null=True, blank=True, related_name='feedbacks')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='given_feedbacks')
    reviewee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_feedbacks')
    rating = models.PositiveSmallIntegerField()  # 1-5
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.reviewer.name} -> {self.reviewee.name}: {self.rating}/5"

    class Meta:
        app_label = 'feedback'

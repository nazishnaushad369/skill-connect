from django.urls import path
from .views import SkillListCreateView, SkillDetailView, MySkillsView, CategoryListView

# IMPORTANT: named paths (mine/, categories/) MUST come before <int:pk>/
# otherwise Django tries to match 'mine' as an integer and raises a 404
urlpatterns = [
    path('', SkillListCreateView.as_view(), name='skill-list'),
    path('mine/', MySkillsView.as_view(), name='my-skills'),
    path('categories/', CategoryListView.as_view(), name='categories'),
    path('<int:pk>/', SkillDetailView.as_view(), name='skill-detail'),
]

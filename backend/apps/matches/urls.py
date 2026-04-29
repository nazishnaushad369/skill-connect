from django.urls import path
from .views import MatchListView, MatchSuggestView, MatchCreateView, MatchAcceptView

urlpatterns = [
    path('', MatchListView.as_view(), name='match-list'),
    path('suggest/', MatchSuggestView.as_view(), name='match-suggest'),
    path('create/', MatchCreateView.as_view(), name='match-create'),
    path('<int:pk>/accept/', MatchAcceptView.as_view(), name='match-accept'),
]

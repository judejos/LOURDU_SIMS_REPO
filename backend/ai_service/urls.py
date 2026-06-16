"""
AI Service — URL Configuration (Stub — Phase 10 will implement fully)
"""
from django.urls import path
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


from .views.chat_views import ChatViews

class AIHealthCheckView(APIView):
    """GET /ai/health/ — AI service health check."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.conf import settings
        return Response({
            'status': 'ok',
            'model': settings.AI_MODEL,
            'api_key_configured': bool(settings.ANTHROPIC_API_KEY),
        })

urlpatterns = [
    path('health/', AIHealthCheckView.as_view(), name='ai-health'),
    path('chat/', ChatViews.as_view(), name='ai-chat'),
]

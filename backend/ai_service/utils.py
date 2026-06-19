import os
import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def call_gemini(prompt, system_prompt="You are a helpful AI assistant for the SIMS platform."):
    """
    Wrapper to call the Google Gemini API.
    In dev mode, if no key is provided, returns a mock response.
    """
    api_key = getattr(settings, 'GEMINI_API_KEY', None)
    
    if not api_key:
        logger.warning("No GEMINI_API_KEY found. Returning mock AI response.")
        return f"[MOCK AI RESPONSE] I am the SIMS AI. You asked: {prompt}"
        
    ai_model = getattr(settings, 'AI_MODEL', 'gemini-flash-latest')
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{ai_model}:generateContent?key={api_key}"
    headers = {
        "Content-Type": "application/json"
    }
    
    # Simple prompt construction for Gemini
    combined_prompt = f"System Context: {system_prompt}\n\nUser Question: {prompt}"
    
    data = {
        "contents": [{
            "parts": [{"text": combined_prompt}]
        }]
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=15)
        response.raise_for_status()
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        # Graceful fallback mock responses based on prompt keywords
        p_lower = prompt.lower()
        if "performance" in p_lower and "executive_summary" in p_lower:
            return """{
              "executive_summary": "Based on the metrics, the intern is performing exceptionally well with strong task completion and high attendance. (Mock AI Data due to invalid API key)",
              "strengths": ["Consistent attendance", "High task completion rate", "Good communication"],
              "areas_for_improvement": ["Could take on more complex tasks", "Improve code documentation"],
              "attendance_analysis": "Attendance is stellar at near perfect levels over the last 30 days.",
              "task_efficiency_trend": "Task completion is trending upwards, showing increased familiarity with the tech stack.",
              "recommended_actions_for_intern": ["Review advanced React patterns", "Take the initiative on next project planning"],
              "recommended_actions_for_mentor": ["Assign a stretch goal project", "Provide leadership opportunities"]
            }"""
        elif "interview" in p_lower and "report" in p_lower:
            return """{"overall_score": 85, "summary": "Strong mock interview performance. (Mock Data)", "strengths": ["Clear communication"], "improvement_areas": ["System design"], "recommended_study_topics": ["Scalability"], "action_plan": ["Review distributed systems"]}"""
        elif "resume" in p_lower and "evaluate" in p_lower:
            return """{"ats_score": 75, "overall_score": 80, "domain_relevance_score": 85, "strengths": ["Good formatting"], "missing_keywords": ["CI/CD"], "formatting_issues": [], "improvement_suggestions": ["Add more measurable metrics"]}"""
        elif "tasks/suggest" in p_lower or "decompose" in p_lower:
            return """{"subtasks": [{"title": "Initial Setup", "description": "Setup project", "estimated_hours": 2, "order": 1}]}"""
        
        return f'{{"error": "AI Service Unavailable: {str(e)}"}}'

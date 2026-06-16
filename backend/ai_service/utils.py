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
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        return f"Error connecting to AI service: {str(e)}"

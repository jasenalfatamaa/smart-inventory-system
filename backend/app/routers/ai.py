from fastapi import APIRouter, Depends, HTTPException
import google.generativeai as genai
from ..schemas import AIInsightRequest
from ..auth import get_current_user
from ..models import User
from ..config import GEMINI_API_KEY
import json

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/insights/")
async def get_ai_insights(req: AIInsightRequest, current_user: User = Depends(get_current_user)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API Key is missing on server.")
        
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"Analisis data inventaris ini dan berikan saran restock singkat (maks 3 poin): {json.dumps(req.inventory_summary)}"
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
            ),
        )
        
        return {"text": response.text or "Tidak dapat memuat wawasan AI saat ini."}
    except Exception as e:
        print(f"Gemini Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error contacting AI service: {str(e)}")

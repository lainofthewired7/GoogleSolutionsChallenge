import os
import google.generativeai as genai
from fastapi import APIRouter, HTTPException, Depends
from api.schemas import ChatRequest, ChatResponse
from api.constants import MARKET_DATA
from api.deps import get_current_user

router = APIRouter()

# Initialize Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

SYSTEM_PROMPT = """
You are Projectr AI, an advanced real estate and economic data assistant for the Projectr Analytics dashboard.
Your goal is to help users understand market trends, housing data, and economic metrics across major US metros.

Context about Projectr Analytics:
- We provide data on Job Growth, Housing Permits, Unemployment, and Rent trends.
- Supported markets include major hubs like Austin, Chicago, New York, Los Angeles, and 40+ others.
- You should be professional, data-driven, and concise.
- If a user asks about a specific market we support, you can reference its general characteristics.
- If you don't have specific real-time data for a query, explain that you can point them to the specific dashboard pages (Jobs, Housing, etc.) for live charts.

Supported Markets Summary:
{markets_summary}
"""

def get_markets_summary():
    summary = []
    for code, info in MARKET_DATA.items():
        summary.append(f"- {info['name']} ({code})")
    return "\n".join(summary[:20]) + "\n... and more."

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    if not model:
        raise HTTPException(
            status_code=503, 
            detail="Gemini API key not configured. Please add GEMINI_API_KEY to your environment."
        )

    try:
        # Build prompt with context
        context = request.market_context or "the current dashboard view"
        full_prompt = f"{SYSTEM_PROMPT.format(markets_summary=get_markets_summary())}\n\nUser is currently looking at: {context}\n\nUser Message: {request.message}"
        
        response = model.generate_content(full_prompt)
        return ChatResponse(response=response.text)
    except Exception as e:
        print(f"Chatbot Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

"""
Aplicación FastAPI del AI Service educativo.
Expone POST /chat y health check.
"""

from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

from app.routers import chat, health  # noqa: E402

app = FastAPI(
    title="AI Service Educativo — Campus IECA",
    description="Agente LangGraph con Gemini 3.5 y tools del MCP Server educativo.",
    version="1.0.0",
)

app.include_router(health.router)
app.include_router(chat.router)

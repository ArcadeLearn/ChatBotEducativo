"""Health check del AI Service educativo."""

from fastapi import APIRouter

from app.services.llm_factory import get_model_name
from app.settings import get_settings
from app.tools.mcp_client import mcp_health_ok

router = APIRouter(tags=["Servicio"])


@router.get("/health")
async def health() -> dict[str, str | bool]:
    """
    Estado del AI Service y dependencias.

    Returns:
        status, servicio, modelo LLM y si MCP responde.
    """
    settings = get_settings()
    return {
        "status": "ok",
        "service": "ai-service-educativo",
        "model": get_model_name(),
        "gemini_configured": bool(settings["google_api_key"]),
        "mcp_available": await mcp_health_ok(),
    }

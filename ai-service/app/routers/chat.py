"""Router de chat educativo."""

import json
from typing import AsyncIterator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.agents.educational_agent import get_active_model_name, run_educational_agent
from app.schemas.chat_schemas import ChatRequest, ChatResponse
from app.settings import get_settings
from app.tools.mcp_client import mcp_health_ok

router = APIRouter(prefix="/chat", tags=["Chat Educativo"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Procesa una pregunta del alumno y retorna respuesta del agente.

    Requiere MCP Server activo y GOOGLE_GEMINI_API_KEY configurada.
    """
    await _ensure_ready()
    history = [item.model_dump() for item in request.history]
    response_text, tools_used, payload = await run_educational_agent(
        message=request.message,
        student_id=request.student_id,
        history=history,
    )
    return ChatResponse(
        response=response_text,
        model=get_active_model_name(),
        student_id=request.student_id,
        tools_used=tools_used,
        payload=payload,
    )


@router.post("/stream")
async def chat_stream(request: ChatRequest) -> StreamingResponse:
    """
    Variante streaming (SSE simplificado): emite la respuesta completa al finalizar.
    En Fase 5 el frontend puede consumir deltas token a token si se extiende.
    """
    await _ensure_ready()
    history = [item.model_dump() for item in request.history]

    async def event_generator() -> AsyncIterator[str]:
        response_text, tools_used, ui_payload = await run_educational_agent(
            message=request.message,
            student_id=request.student_id,
            history=history,
        )
        sse_payload = {
            "delta": response_text,
            "done": True,
            "model": get_active_model_name(),
            "tools_used": tools_used,
            "payload": ui_payload,
        }
        yield f"data: {json.dumps(sse_payload, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


async def _ensure_ready() -> None:
    """Valida API key Gemini y disponibilidad del MCP."""
    settings = get_settings()
    if not settings["google_api_key"]:
        raise HTTPException(
            status_code=503,
            detail="GOOGLE_GEMINI_API_KEY no configurada en ai-service/.env",
        )
    if not await mcp_health_ok():
        raise HTTPException(
            status_code=503,
            detail="MCP Server no disponible. Levanta mcp-server en :8002 primero.",
        )

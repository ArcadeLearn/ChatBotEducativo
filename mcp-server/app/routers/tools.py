"""Router de invocación dinámica de tools educativas."""

from typing import Any

from fastapi import APIRouter, Body, HTTPException
from pydantic import ValidationError

from app.registry import TOOL_DESCRIPTIONS, TOOL_REGISTRY
from app.schemas.tool_schemas import ToolResponse

router = APIRouter(prefix="/api/tools", tags=["MCP Tools"])

TOOL_BODY_EXAMPLES: dict[str, dict[str, Any]] = {
    "get_student_profile": {"student_id": "user-01"},
    "get_enrolled_courses": {"student_id": "user-01"},
    "get_course_detail": {"course_id": "curso-01", "student_id": "user-01"},
    "search_course_catalog": {"query": "automatizacion", "level": "intermedio"},
    "get_learning_paths": {"specialty": "Mecatronica"},
    "get_student_stats": {"student_id": "user-01"},
    "get_certificates": {"student_id": "user-01"},
    "get_announcements": {"type": "evento"},
    "get_planteles": {"city": "Leon"},
    "get_invoices": {"student_id": "user-01"},
}


@router.get("")
async def list_tools() -> dict[str, list[str]]:
    """Lista los nombres de todas las tools registradas."""
    return {"tools": list(TOOL_REGISTRY.keys())}


@router.get("/descriptions")
async def list_tool_descriptions() -> dict[str, dict[str, str]]:
    """Devuelve descripciones breves de cada tool para el agente LLM."""
    return {"descriptions": TOOL_DESCRIPTIONS}


@router.post("/{tool_name}", response_model=ToolResponse)
async def invoke_tool(
    tool_name: str,
    body: dict[str, Any] = Body(default_factory=dict),
) -> ToolResponse:
    """
    Ejecuta una tool educativa por nombre.

    Args:
        tool_name: Nombre registrado en TOOL_REGISTRY.
        body: Parámetros específicos de la tool.

    Returns:
        ToolResponse con data o error de validación/ejecución.
    """
    if tool_name not in TOOL_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Tool no encontrada: {tool_name}")

    handler = TOOL_REGISTRY[tool_name]
    try:
        return handler(body)
    except ValidationError as exc:
        return ToolResponse(success=False, error=str(exc), meta={"tool": tool_name})
    except FileNotFoundError as exc:
        return ToolResponse(success=False, error=str(exc), meta={"tool": tool_name})
    except Exception as exc:  # noqa: BLE001 — boundary HTTP; detalle en logs futuros
        return ToolResponse(success=False, error=f"Error interno: {exc}", meta={"tool": tool_name})

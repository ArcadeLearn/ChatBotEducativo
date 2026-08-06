"""
Wrappers LangChain de las 10 tools educativas del MCP Server.
Cada tool inyecta student_id cuando aplica para simplificar el uso del agente.
"""

import json
from typing import Any

from langchain_core.tools import BaseTool, StructuredTool
from pydantic import BaseModel, Field

from app.tools.mcp_client import invoke_mcp_tool


def _format_mcp_result(result: dict[str, Any]) -> str:
    """Serializa respuesta MCP para el LLM."""
    if not result.get("success", True):
        return json.dumps({"error": result.get("error", "Error desconocido")}, ensure_ascii=False)
    return json.dumps(result.get("data"), ensure_ascii=False)


async def _call(tool_name: str, payload: dict[str, Any]) -> str:
    result = await invoke_mcp_tool(tool_name, payload)
    return _format_mcp_result(result)


class CourseDetailInput(BaseModel):
    """Parámetros para detalle de curso."""

    course_id: str = Field(..., description="ID del curso, ej. curso-01")


class SearchCatalogInput(BaseModel):
    """Parámetros para búsqueda en catálogo."""

    query: str | None = Field(default=None, description="Texto de búsqueda")
    category: str | None = Field(default=None, description="Categoría del curso")
    level: str | None = Field(default=None, description="Principiante, Intermedio o Avanzado")


class LearningPathsInput(BaseModel):
    """Parámetros para rutas de aprendizaje."""

    specialty: str | None = Field(default=None, description="Especialidad o categoría, ej. Mecatrónica")


class AnnouncementsInput(BaseModel):
    """Parámetros para avisos."""

    type: str | None = Field(default=None, description="evento, noticia o promocion")


class PlantelesInput(BaseModel):
    """Parámetros para sedes."""

    city: str | None = Field(default=None, description="Ciudad o municipio, ej. León")
    specialty: str | None = Field(
        default=None,
        description="Especialidad técnica, ej. robótica, metrología, PLC",
    )


def build_edu_tools(student_id: str) -> list[BaseTool]:
    """
    Construye tools LangChain con student_id pre-inyectado.

    Args:
        student_id: Alumno activo en la conversación.

    Returns:
        Lista de tools para create_react_agent.
    """

    async def get_student_profile() -> str:
        """Obtiene perfil del alumno: matrícula, horas completadas, certificados, especialidad."""
        return await _call("get_student_profile", {"student_id": student_id})

    async def get_enrolled_courses() -> str:
        """Lista cursos inscritos del alumno con porcentaje de progreso."""
        return await _call("get_enrolled_courses", {"student_id": student_id})

    async def get_course_detail(course_id: str) -> str:
        """Detalle de un curso inscrito: módulos, lecciones y avance. Requiere course_id."""
        return await _call(
            "get_course_detail",
            {"course_id": course_id, "student_id": student_id},
        )

    async def search_course_catalog(
        query: str | None = None,
        category: str | None = None,
        level: str | None = None,
    ) -> str:
        """Busca cursos disponibles en la tienda por texto, categoría o nivel."""
        payload = {k: v for k, v in {"query": query, "category": category, "level": level}.items() if v}
        return await _call("search_course_catalog", payload)

    async def get_learning_paths(specialty: str | None = None) -> str:
        """Rutas de aprendizaje disponibles; opcional filtrar por especialidad."""
        payload = {"specialty": specialty} if specialty else {}
        return await _call("get_learning_paths", payload)

    async def get_student_stats() -> str:
        """Historial RPG, XP, dimensiones de habilidad y cursos acreditados del alumno."""
        return await _call("get_student_stats", {"student_id": student_id})

    async def get_certificates() -> str:
        """Constancias y certificados obtenidos por el alumno."""
        return await _call("get_certificates", {"student_id": student_id})

    async def get_announcements(type: str | None = None) -> str:  # noqa: A002
        """Avisos del campus: eventos, noticias o promociones."""
        payload = {"type": type} if type else {}
        return await _call("get_announcements", payload)

    async def get_planteles(
        city: str | None = None,
        specialty: str | None = None,
    ) -> str:
        """Sedes IECA con ubicación, horarios y especialidades. Filtra por ciudad o especialidad."""
        payload = {
            k: v
            for k, v in {"city": city, "specialty": specialty}.items()
            if v
        }
        return await _call("get_planteles", payload)

    async def get_invoices() -> str:
        """Historial de facturas y pagos CFDI del alumno."""
        return await _call("get_invoices", {"student_id": student_id})

    return [
        StructuredTool.from_function(coroutine=get_student_profile, name="get_student_profile"),
        StructuredTool.from_function(coroutine=get_enrolled_courses, name="get_enrolled_courses"),
        StructuredTool.from_function(
            coroutine=get_course_detail,
            name="get_course_detail",
            args_schema=CourseDetailInput,
        ),
        StructuredTool.from_function(
            coroutine=search_course_catalog,
            name="search_course_catalog",
            args_schema=SearchCatalogInput,
        ),
        StructuredTool.from_function(
            coroutine=get_learning_paths,
            name="get_learning_paths",
            args_schema=LearningPathsInput,
        ),
        StructuredTool.from_function(coroutine=get_student_stats, name="get_student_stats"),
        StructuredTool.from_function(coroutine=get_certificates, name="get_certificates"),
        StructuredTool.from_function(
            coroutine=get_announcements,
            name="get_announcements",
            args_schema=AnnouncementsInput,
        ),
        StructuredTool.from_function(
            coroutine=get_planteles,
            name="get_planteles",
            args_schema=PlantelesInput,
        ),
        StructuredTool.from_function(coroutine=get_invoices, name="get_invoices"),
    ]

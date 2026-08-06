"""Schemas Pydantic v2 para requests y responses de tools educativas."""

from typing import Any

from pydantic import BaseModel, Field


class ToolResponse(BaseModel):
    """Respuesta estándar de una tool del MCP educativo."""

    success: bool = True
    data: Any = None
    error: str | None = None
    meta: dict[str, Any] = Field(default_factory=dict)


class StudentIdRequest(BaseModel):
    """Request con identificador de alumno."""

    student_id: str = Field(..., description="ID del alumno (ej. user-01)")


class CourseDetailRequest(BaseModel):
    """Request para detalle de curso inscrito."""

    course_id: str = Field(..., description="ID del curso (ej. curso-01)")
    student_id: str | None = Field(
        default=None,
        description="Opcional: filtra por alumno inscrito",
    )


class SearchCatalogRequest(BaseModel):
    """Request para búsqueda en catálogo de cursos."""

    query: str | None = Field(default=None, description="Texto libre de búsqueda")
    category: str | None = Field(default=None, description="Categoría del curso")
    level: str | None = Field(default=None, description="Nivel: Principiante, Intermedio, Avanzado")


class LearningPathsRequest(BaseModel):
    """Request para rutas de aprendizaje."""

    specialty: str | None = Field(
        default=None,
        description="Filtrar por categoría o palabra clave (ej. Mecatrónica)",
    )


class AnnouncementsRequest(BaseModel):
    """Request para avisos institucionales."""

    type: str | None = Field(
        default=None,
        description="Tipo: evento, noticia o promocion",
    )


class PlantelesRequest(BaseModel):
    """Request para sedes IECA."""

    city: str | None = Field(default=None, description="Filtrar por municipio o ciudad")
    specialty: str | None = Field(
        default=None,
        description="Filtrar por especialidad (ej. robótica, metrología, PLC)",
    )


class InvoicesRequest(BaseModel):
    """Request para facturas del alumno."""

    student_id: str = Field(..., description="ID del alumno")

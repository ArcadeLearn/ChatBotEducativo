"""
Registro centralizado de tools educativas del MCP Server.
Cada handler recibe un dict de parámetros y retorna ToolResponse.
"""

from collections.abc import Callable
from typing import Any

from app.schemas.tool_schemas import ToolResponse
from app.tools.campus_tools import (
    get_announcements,
    get_invoices,
    get_learning_paths,
    get_planteles,
)
from app.tools.course_tools import (
    get_course_detail,
    get_enrolled_courses,
    search_course_catalog,
)
from app.tools.student_tools import get_certificates, get_student_profile, get_student_stats

ToolHandler = Callable[[dict[str, Any]], ToolResponse]

TOOL_REGISTRY: dict[str, ToolHandler] = {
    "get_student_profile": get_student_profile,
    "get_enrolled_courses": get_enrolled_courses,
    "get_course_detail": get_course_detail,
    "search_course_catalog": search_course_catalog,
    "get_learning_paths": get_learning_paths,
    "get_student_stats": get_student_stats,
    "get_certificates": get_certificates,
    "get_announcements": get_announcements,
    "get_planteles": get_planteles,
    "get_invoices": get_invoices,
}

TOOL_DESCRIPTIONS: dict[str, str] = {
    "get_student_profile": "Perfil del alumno: matrícula, horas, certificados, especialidad.",
    "get_enrolled_courses": "Cursos inscritos del alumno con progreso por curso.",
    "get_course_detail": "Detalle de un curso inscrito: módulos, lecciones y avance.",
    "search_course_catalog": "Buscar cursos disponibles en la tienda por texto, categoría o nivel.",
    "get_learning_paths": "Rutas de aprendizaje disponibles, filtrables por especialidad.",
    "get_student_stats": "Historial RPG, XP, dimensiones y cursos acreditados del alumno.",
    "get_certificates": "Constancias y certificados obtenidos por el alumno.",
    "get_announcements": "Avisos, eventos y promociones del campus.",
    "get_planteles": "Sedes IECA con ubicación, horarios y especialidades.",
    "get_invoices": "Historial de pagos y facturas CFDI del alumno.",
}

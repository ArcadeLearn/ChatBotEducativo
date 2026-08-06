"""Tools educativas de cursos inscritos y catálogo disponible."""

from typing import Any

from app.schemas.tool_schemas import (
    CourseDetailRequest,
    SearchCatalogRequest,
    StudentIdRequest,
    ToolResponse,
)
from app.utils.json_loader import load_json_file, normalize_text


def _find_enrollment(student_id: str) -> dict[str, Any] | None:
    payload = load_json_file("enrolled_courses.json")
    return next(
        (item for item in payload.get("enrollments", []) if item.get("student_id") == student_id),
        None,
    )


def get_enrolled_courses(params: dict[str, Any]) -> ToolResponse:
    """
    Lista cursos inscritos del alumno con progreso por curso.

    Args:
        params: Dict con student_id.

    Returns:
        ToolResponse con cursos inscritos y resumen de progreso.
    """
    request = StudentIdRequest.model_validate(params)
    enrollment = _find_enrollment(request.student_id)
    if not enrollment:
        return ToolResponse(
            success=False,
            error=f"Sin inscripciones para el alumno: {request.student_id}",
        )
    courses = enrollment.get("courses", [])
    summary = {
        "total_courses": len(courses),
        "average_progress": round(
            sum(course.get("progressPercentage", 0) for course in courses) / max(len(courses), 1),
            1,
        ),
    }
    return ToolResponse(
        data={
            "student_id": request.student_id,
            "courses": courses,
            "summary": summary,
        },
        meta={"tool": "get_enrolled_courses"},
    )


def get_course_detail(params: dict[str, Any]) -> ToolResponse:
    """
    Devuelve módulos y lecciones de un curso inscrito.

    Args:
        params: Dict con course_id y student_id opcional.

    Returns:
        ToolResponse con detalle del curso o error 404 lógico.
    """
    request = CourseDetailRequest.model_validate(params)
    payload = load_json_file("enrolled_courses.json")
    courses: list[dict[str, Any]] = []
    for enrollment in payload.get("enrollments", []):
        if request.student_id and enrollment.get("student_id") != request.student_id:
            continue
        courses.extend(enrollment.get("courses", []))

    course = next((item for item in courses if item.get("id") == request.course_id), None)
    if not course:
        return ToolResponse(success=False, error=f"Curso no encontrado: {request.course_id}")
    return ToolResponse(data=course, meta={"tool": "get_course_detail"})


def search_course_catalog(params: dict[str, Any]) -> ToolResponse:
    """
    Busca cursos disponibles en la tienda por texto, categoría o nivel.

    Args:
        params: Dict con query, category y level opcionales.

    Returns:
        ToolResponse con cursos que coinciden con los filtros.
    """
    request = SearchCatalogRequest.model_validate(params)
    payload = load_json_file("course_catalog.json")
    courses = payload.get("courses", [])

    query_norm = normalize_text(request.query) if request.query else None
    category_norm = normalize_text(request.category) if request.category else None
    level_norm = normalize_text(request.level) if request.level else None

    def matches(course: dict[str, Any]) -> bool:
        if category_norm and category_norm not in normalize_text(str(course.get("category", ""))):
            return False
        if level_norm and level_norm not in normalize_text(str(course.get("level", ""))):
            return False
        if not query_norm:
            return True
        haystack = " ".join(
            [
                str(course.get("title", "")),
                str(course.get("description", "")),
                str(course.get("category", "")),
                str(course.get("instructor", "")),
            ]
        )
        return query_norm in normalize_text(haystack)

    filtered = [course for course in courses if matches(course)]
    return ToolResponse(
        data={"courses": filtered, "total": len(filtered), "filters": request.model_dump(exclude_none=True)},
        meta={"tool": "search_course_catalog"},
    )

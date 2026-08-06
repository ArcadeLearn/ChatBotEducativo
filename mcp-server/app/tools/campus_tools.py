"""Tools educativas de rutas, avisos, planteles y facturas."""

from typing import Any

from app.schemas.tool_schemas import (
    AnnouncementsRequest,
    InvoicesRequest,
    LearningPathsRequest,
    PlantelesRequest,
    ToolResponse,
)
from app.utils.json_loader import load_json_file, normalize_text


def get_learning_paths(params: dict[str, Any]) -> ToolResponse:
    """
    Lista rutas de aprendizaje, opcionalmente filtradas por especialidad.

    Args:
        params: Dict con specialty opcional.

    Returns:
        ToolResponse con rutas y metadatos de progreso.
    """
    request = LearningPathsRequest.model_validate(params)
    payload = load_json_file("learning_paths.json")
    paths = payload.get("paths", [])

    if request.specialty:
        specialty_norm = normalize_text(request.specialty)
        paths = [
            path
            for path in paths
            if specialty_norm in normalize_text(str(path.get("category", "")))
            or specialty_norm in normalize_text(str(path.get("title", "")))
            or specialty_norm in normalize_text(" ".join(path.get("targetRoles", [])))
        ]

    summary = [
        {
            "id": path.get("id"),
            "title": path.get("title"),
            "category": path.get("category"),
            "progressPercentage": path.get("progressPercentage"),
            "totalHours": path.get("totalHours"),
            "isActive": path.get("isActive"),
        }
        for path in paths
    ]
    return ToolResponse(
        data={"paths": paths, "summary": summary, "total": len(paths)},
        meta={"tool": "get_learning_paths"},
    )


def get_announcements(params: dict[str, Any]) -> ToolResponse:
    """
    Obtiene avisos institucionales: eventos, noticias o promociones.

    Args:
        params: Dict con type opcional.

    Returns:
        ToolResponse con avisos filtrados.
    """
    request = AnnouncementsRequest.model_validate(params)
    payload = load_json_file("announcements.json")
    announcements = payload.get("announcements", [])

    if request.type:
        type_norm = normalize_text(request.type)
        announcements = [
            item for item in announcements if normalize_text(str(item.get("type", ""))) == type_norm
        ]

    return ToolResponse(
        data={"announcements": announcements, "total": len(announcements)},
        meta={"tool": "get_announcements"},
    )


def get_planteles(params: dict[str, Any]) -> ToolResponse:
    """
    Lista sedes IECA con ubicación y especialidades.

    Args:
        params: Dict con city opcional para filtrar por municipio.

    Returns:
        ToolResponse con planteles encontrados.
    """
    request = PlantelesRequest.model_validate(params)
    payload = load_json_file("planteles.json")
    all_planteles = payload.get("planteles", [])
    planteles = list(all_planteles)

    if request.city:
        city_norm = normalize_text(request.city)
        planteles = [
            item
            for item in planteles
            if city_norm in normalize_text(str(item.get("municipio", "")))
            or city_norm in normalize_text(str(item.get("nombre", "")))
        ]

    if request.specialty:
        specialty_norm = normalize_text(request.specialty)
        planteles = [
            item
            for item in planteles
            if any(
                specialty_norm in normalize_text(str(spec))
                or normalize_text(str(spec)) in specialty_norm
                for spec in item.get("especialidades", [])
            )
            or any(
                keyword in normalize_text(" ".join(item.get("especialidades", [])))
                for keyword in ("robotica", "yaskawa", "kuka")
                if "robot" in specialty_norm
            )
        ]

    return ToolResponse(
        data={
            "planteles": planteles,
            "total": len(planteles),
            "catalog_total": len(all_planteles),
            "filter_applied": bool(request.city or request.specialty),
        },
        meta={"tool": "get_planteles"},
    )


def get_invoices(params: dict[str, Any]) -> ToolResponse:
    """
    Obtiene historial de facturas CFDI del alumno.

    Args:
        params: Dict con student_id.

    Returns:
        ToolResponse con facturas y total pendiente/pagado.
    """
    request = InvoicesRequest.model_validate(params)
    payload = load_json_file("invoices.json")
    invoices = [
        item for item in payload.get("invoices", []) if item.get("student_id") == request.student_id
    ]
    paid_total = sum(item.get("amount", 0) for item in invoices if item.get("status") == "Pagado")
    return ToolResponse(
        data={
            "student_id": request.student_id,
            "invoices": invoices,
            "total": len(invoices),
            "paid_total": paid_total,
        },
        meta={"tool": "get_invoices"},
    )

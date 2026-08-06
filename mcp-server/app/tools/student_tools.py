"""Tools educativas relacionadas con perfil, stats y certificados del alumno."""

import re
from typing import Any

from app.schemas.tool_schemas import StudentIdRequest, ToolResponse
from app.utils.json_loader import load_json_file

_SPANISH_MONTHS = {
    "enero": 1,
    "febrero": 2,
    "marzo": 3,
    "abril": 4,
    "mayo": 5,
    "junio": 6,
    "julio": 7,
    "agosto": 8,
    "septiembre": 9,
    "octubre": 10,
    "noviembre": 11,
    "diciembre": 12,
}


def _certificate_recency_key(cert: dict[str, Any]) -> tuple[int, int, int]:
    """Clave (año, mes, día) para ordenar por fecha de acreditación."""
    date_str = (cert.get("accreditation_date") or "").lower()
    match = re.match(r"(\d+)\s+(\w+),\s+(\d{4})", date_str)
    if match:
        month = _SPANISH_MONTHS.get(match.group(2), 0)
        return (int(match.group(3)), month, int(match.group(1)))

    cert_id = cert.get("certificate_id") or ""
    parts = cert_id.split("-")
    if len(parts) >= 2 and parts[1].isdigit():
        return (int(parts[1]), 0, 0)
    return (0, 0, 0)


def _sort_certificates_recent_first(certs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Ordena certificados del más reciente al más antiguo."""
    return sorted(certs, key=_certificate_recency_key, reverse=True)


def get_student_profile(params: dict[str, Any]) -> ToolResponse:
    """
    Obtiene el perfil completo de un alumno por student_id.

    Args:
        params: Dict con student_id.

    Returns:
        ToolResponse con el perfil o error si no existe.
    """
    request = StudentIdRequest.model_validate(params)
    payload = load_json_file("students.json")
    student = next(
        (item for item in payload.get("students", []) if item.get("id") == request.student_id),
        None,
    )
    if not student:
        return ToolResponse(success=False, error=f"Alumno no encontrado: {request.student_id}")
    return ToolResponse(data=student, meta={"tool": "get_student_profile"})


def get_student_stats(params: dict[str, Any]) -> ToolResponse:
    """
    Obtiene historial RPG, XP, dimensiones y cursos acreditados del alumno.

    Args:
        params: Dict con student_id.

    Returns:
        ToolResponse con estadísticas completas o resumen parcial.
    """
    request = StudentIdRequest.model_validate(params)
    payload = load_json_file("student_stats.json")
    if payload.get("student_id") != request.student_id:
        return ToolResponse(
            success=False,
            error=f"Estadísticas no disponibles para: {request.student_id}",
        )
    return ToolResponse(data=payload, meta={"tool": "get_student_stats"})


def get_certificates(params: dict[str, Any]) -> ToolResponse:
    """
    Lista constancias y certificados obtenidos por el alumno.

    Args:
        params: Dict con student_id.

    Returns:
        ToolResponse con lista de certificados filtrados.
    """
    request = StudentIdRequest.model_validate(params)
    payload = load_json_file("certificates.json")
    certificates = [
        item
        for item in payload.get("certificates", [])
        if item.get("student_id") == request.student_id
    ]
    certificates = _sort_certificates_recent_first(certificates)
    return ToolResponse(
        data={"student_id": request.student_id, "certificates": certificates, "total": len(certificates)},
        meta={"tool": "get_certificates"},
    )

"""
Construcción de payload UI rico a partir de outputs de tools MCP.
Prioriza detalle de un curso cuando la pregunta es específica.
"""

from typing import Any

from app.agents.conversation_intent import is_announcements_query, is_learning_paths_query
from app.agents.course_query import (
    extract_requested_course_title,
    is_specific_course_query,
    match_course_from_query,
)
from app.agents.announcement_timeframe import filter_announcements_by_timeframe
from app.agents.invoices_query import (
    compute_invoice_summary,
    detect_invoice_focus,
    filter_invoices_by_focus,
    invoice_view_mode,
)
from app.agents.planteles_query import apply_planteles_query_filter, slim_plantel_for_map
from app.settings import get_max_ui_cards

TOOL_PAYLOAD_TYPES: dict[str, str] = {
    "get_enrolled_courses": "enrolled_courses",
    "get_course_detail": "course_detail",
    "search_course_catalog": "course_catalog",
    "get_student_stats": "student_stats",
    "get_certificates": "certificates",
    "get_announcements": "announcements",
    "get_student_profile": "student_profile",
    "get_learning_paths": "learning_paths",
    "get_planteles": "planteles",
    "get_invoices": "invoices",
}

# Prioridad: detalle de curso antes que listado general
PAYLOAD_TOOL_PRIORITY: tuple[str, ...] = (
    "get_course_detail",
    "get_enrolled_courses",
    "get_student_stats",
    "get_certificates",
    "search_course_catalog",
    "get_announcements",
    "get_student_profile",
    "get_learning_paths",
    "get_planteles",
    "get_invoices",
)


def build_ui_payload(
    tools_used: list[str],
    tool_outputs: dict[str, Any],
    user_message: str = "",
) -> dict[str, Any] | None:
    """
    Construye payload UI priorizando contexto de la pregunta.

    Args:
        tools_used: Tools invocadas en orden.
        tool_outputs: Mapa tool_name → data MCP parseada.
        user_message: Pregunta original del alumno (para filtrar curso).

    Returns:
        Dict { type, data } o None.
    """
    specific = is_specific_course_query(user_message)
    priority = _payload_tool_priority(user_message)

    for tool_name in priority:
        if tool_name not in tools_used:
            continue
        raw = tool_outputs.get(tool_name)
        if raw is None or (isinstance(raw, dict) and raw.get("error")):
            continue

        payload_type = TOOL_PAYLOAD_TYPES.get(tool_name)
        if not payload_type:
            continue

        data = _normalize_data(payload_type, raw, user_message, specific)
        if data is not None:
            return data

    return None


def _payload_tool_priority(user_message: str) -> tuple[str, ...]:
    """
    Orden de tools para elegir tarjeta UI según la intención de la pregunta.

    Las preguntas sobre rutas o eventos deben priorizar la tool correcta aunque
    el LLM invoque otras (p. ej. perfil del alumno).
    """
    if is_learning_paths_query(user_message):
        preferred = ("get_learning_paths",)
        rest = tuple(name for name in PAYLOAD_TOOL_PRIORITY if name not in preferred)
        return preferred + rest

    if is_announcements_query(user_message):
        preferred = ("get_announcements",)
        rest = tuple(name for name in PAYLOAD_TOOL_PRIORITY if name not in preferred)
        return preferred + rest

    return PAYLOAD_TOOL_PRIORITY


def _normalize_data(
    payload_type: str,
    raw: Any,
    user_message: str,
    specific_query: bool,
) -> dict[str, Any] | None:
    """Adapta estructura MCP al contrato del frontend."""
    if not isinstance(raw, dict):
        if payload_type == "course_detail" and isinstance(raw, dict):
            return {"type": "course_detail", "data": raw}
        return None

    if payload_type == "course_detail":
        if raw.get("id") and raw.get("title"):
            return {"type": "course_detail", "data": raw}
        return None

    if payload_type == "enrolled_courses":
        courses = raw.get("courses", [])
        if not courses:
            return None

        if specific_query or is_specific_course_query(user_message):
            matched = match_course_from_query(courses, user_message)
            if matched:
                return {"type": "course_detail", "data": matched}

            requested = extract_requested_course_title(user_message)
            if requested:
                limit = get_max_ui_cards()
                sorted_courses = sorted(
                    courses,
                    key=lambda course: course.get("progressPercentage", 0),
                    reverse=True,
                )
                visible = sorted_courses[:limit]
                return {
                    "type": "course_not_found",
                    "data": {
                        "requested_title": requested,
                        "reason": "not_enrolled",
                        "entity_type": "course",
                        "courses": visible,
                        "total_enrolled": len(courses),
                    },
                }

        # Pregunta general ("cuántos cursos", "mis cursos") → grid resumido limitado
        total = len(courses)
        limit = get_max_ui_cards()
        sorted_courses = sorted(
            courses,
            key=lambda course: course.get("progressPercentage", 0),
            reverse=True,
        )
        visible = sorted_courses[:limit]
        summary = dict(raw.get("summary") or {})
        summary["total_courses"] = total
        return {
            "type": "enrolled_courses",
            "data": {"courses": visible, "total": total, "summary": summary},
        }

    if payload_type == "course_catalog":
        courses = raw.get("courses", [])
        limit = get_max_ui_cards()
        visible = courses[:limit]
        if not visible and user_message.strip():
            return {
                "type": "not_found",
                "data": {
                    "entity_type": "catalog",
                    "requested_label": user_message.strip()[:120],
                    "reason": "no_catalog_results",
                },
            }
        return (
            {
                "type": "course_catalog",
                "data": {"courses": visible, "total": raw.get("total", len(courses))},
            }
            if visible
            else None
        )

    if payload_type == "certificates":
        certs = _sort_certificates_recent_first(raw.get("certificates", []))
        limit = get_max_ui_cards()
        recent = certs[:limit]
        return (
            {
                "type": "certificates",
                "data": {"certificates": recent, "total": raw.get("total", len(certs))},
            }
            if recent
            else None
        )

    if payload_type == "announcements":
        items = raw.get("announcements", [])
        filtered = filter_announcements_by_timeframe(items, user_message)
        display_items = filtered.items
        limit = get_max_ui_cards()
        visible = display_items[:limit]
        next_event_date = None
        if visible and filtered.filter_type == "evento":
            from app.agents.announcement_timeframe import format_spanish_date, parse_announcement_dates

            parsed = parse_announcement_dates(
                str(visible[0].get("date", "")),
                reference=filtered.date_context.today,
            )
            if parsed:
                next_event_date = format_spanish_date(min(parsed))

        return (
            {
                "type": "announcements",
                "data": {
                    "announcements": visible,
                    "total": (
                        filtered.matched_total
                        if filtered.scope == "matched"
                        else len(display_items)
                    ),
                    "catalog_total": len(items),
                    "timeframe": filtered.timeframe,
                    "scope": filtered.scope,
                    "matched_total": filtered.matched_total,
                    "filter_type": filtered.filter_type,
                    "reference_date": filtered.date_context.reference_label,
                    "period_label": filtered.period_label,
                    "next_event_date": next_event_date,
                },
            }
            if visible
            else None
        )

    if payload_type == "learning_paths":
        paths = raw.get("paths", [])
        limit = get_max_ui_cards()
        visible = [_slim_learning_path(p) for p in paths[:limit]]
        return (
            {
                "type": "learning_paths",
                "data": {"paths": visible, "total": raw.get("total", len(paths))},
            }
            if visible
            else None
        )

    if payload_type == "planteles":
        items = raw.get("planteles", [])
        catalog_total = int(raw.get("catalog_total") or len(items))

        if user_message and len(items) >= catalog_total:
            items, filter_meta = apply_planteles_query_filter(
                items, user_message, catalog_total=catalog_total
            )
        else:
            filter_meta = {
                "catalog_total": catalog_total,
                "filtered": bool(raw.get("filter_applied")) or len(items) < catalog_total,
                "filter_label": None,
                "show_all": len(items) >= catalog_total,
            }

        map_planteles = [
            slim_plantel_for_map(p)
            for p in items
            if p.get("lat") is not None and p.get("lng") is not None
        ]
        filtered = filter_meta.get("filtered", False)
        if not items and filtered:
            return {
                "type": "not_found",
                "data": {
                    "entity_type": "plantel",
                    "requested_label": filter_meta.get("filter_label") or user_message.strip()[:80],
                    "reason": "no_plantel_match",
                    "catalog_total": catalog_total,
                },
            }
        return (
            {
                "type": "planteles",
                "data": {
                    "planteles": items,
                    "map_planteles": map_planteles,
                    "total": len(items),
                    "catalog_total": catalog_total,
                    "filtered": filtered,
                    "filter_label": filter_meta.get("filter_label"),
                    "show_all": filter_meta.get("show_all", len(items) >= catalog_total),
                },
            }
            if items
            else None
        )

    if payload_type == "invoices":
        all_items = list(raw.get("invoices") or [])
        focus = detect_invoice_focus(user_message) if user_message else "all"
        filtered = filter_invoices_by_focus(all_items, focus)
        sorted_items = sorted(
            filtered,
            key=lambda item: str(item.get("date") or ""),
            reverse=True,
        )
        summary = compute_invoice_summary(all_items)
        limit = get_max_ui_cards()
        visible = sorted_items[:limit]
        view_mode = invoice_view_mode(focus)
        return {
            "type": "invoices",
            "data": {
                "invoices": visible,
                "total": len(filtered),
                "catalog_total": len(all_items),
                "paid_total": summary["paid_total"],
                "pending_total": summary["pending_total"],
                "paid_count": summary["paid_count"],
                "pending_count": summary["pending_count"],
                "focus": focus,
                "view_mode": view_mode,
                "empty": len(filtered) == 0,
            },
        }

    if payload_type == "student_stats":
        return {"type": "student_stats", "data": raw}

    if payload_type == "student_profile":
        return {"type": "student_profile", "data": raw}

    return {"type": payload_type, "data": raw} if raw else None


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


def _sort_certificates_recent_first(certs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Ordena certificados del más reciente al más antiguo."""
    return sorted(certs, key=_certificate_recency_key, reverse=True)


def _certificate_recency_key(cert: dict[str, Any]) -> tuple[int, int, int]:
    """Clave (año, mes, día) para ordenar por fecha de acreditación."""
    import re

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


def _slim_learning_path(path: dict[str, Any]) -> dict[str, Any]:
    """Campos de ruta para tarjeta UI sin nodos ni metadatos pesados."""
    keys = (
        "id",
        "title",
        "subtitle",
        "category",
        "description",
        "estimatedDurationMonths",
        "totalHours",
        "totalModules",
        "progressPercentage",
        "isActive",
        "certifiedBy",
        "badge",
        "colorGradient",
        "targetRoles",
        "enrolledStudentsCount",
    )
    return {k: path[k] for k in keys if k in path}

"""
Filtro de planteles según la pregunta del alumno (ciudad, especialidad).
Cuando la búsqueda es específica, mapa e intro muestran solo las sedes coincidentes.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Any

_CITY_ALIASES: dict[str, tuple[str, ...]] = {
    "leon": ("leon", "león"),
    "irapuato": ("irapuato",),
    "silao": ("silao",),
    "celaya": ("celaya",),
    "guanajuato": ("guanajuato",),
    "salamanca": ("salamanca",),
    "valtierrilla": ("valtierrilla",),
}

_SPECIALTY_RULES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("robótica", ("robotica", "robots", "yaskawa", "kuka", "robot")),
    ("metrología 3D", ("metrologia", "metrología", "cmm", "zeiss")),
    ("PLC", ("plc", "programacion plc", "programación plc")),
    ("calzado", ("calzado", "marroquineria", "marroquinería")),
    ("mantenimiento", ("mantenimiento", "electromecanico", "electromecánico")),
    ("soldadura", ("soldadura", "welding")),
    ("automotriz", ("automotriz", "automotive")),
)


def normalize_text(text: str) -> str:
    """Normaliza texto para comparación (sin acentos, minúsculas)."""
    normalized = unicodedata.normalize("NFD", text or "")
    stripped = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    return stripped.lower().strip()


def detect_planteles_filter(user_message: str) -> dict[str, str | None]:
    """
    Detecta filtros de ciudad o especialidad en la pregunta.

    Returns:
        Dict con city, specialty (etiqueta legible) o None.
    """
    query = normalize_text(user_message)
    city: str | None = None
    specialty: str | None = None

    for city_key, aliases in _CITY_ALIASES.items():
        if any(re.search(rf"\b{normalize_text(alias)}\b", query) for alias in aliases):
            city = city_key.capitalize() if city_key != "leon" else "León"
            break

    for label, keywords in _SPECIALTY_RULES:
        if any(keyword in query for keyword in keywords):
            specialty = label
            break

    if "especialidad" in query or "especialidades" in query:
        for label, keywords in _SPECIALTY_RULES:
            if any(keyword in query for keyword in keywords):
                specialty = label
                break

    return {"city": city, "specialty": specialty}


def plantel_matches_specialty(plantel: dict[str, Any], specialty_label: str) -> bool:
    """True si el plantel incluye la especialidad buscada."""
    blob = normalize_text(" ".join(plantel.get("especialidades") or []))
    label_norm = normalize_text(specialty_label)

    for label, keywords in _SPECIALTY_RULES:
        if normalize_text(label) == label_norm:
            return any(keyword in blob for keyword in keywords)
    return label_norm in blob


def plantel_matches_city(plantel: dict[str, Any], city: str) -> bool:
    """True si el plantel pertenece al municipio/ciudad indicada."""
    city_norm = normalize_text(city)
    municipio = normalize_text(str(plantel.get("municipio", "")))
    nombre = normalize_text(str(plantel.get("nombre", "")))
    return city_norm in municipio or city_norm in nombre


def apply_planteles_query_filter(
    items: list[dict[str, Any]],
    user_message: str,
    *,
    catalog_total: int | None = None,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """
    Filtra planteles según pregunta; conserva total de red para intros parciales.

    Args:
        items: Planteles devueltos por MCP (pueden estar ya filtrados).
        user_message: Pregunta del alumno.
        catalog_total: Total de sedes en la red (18).

    Returns:
        (items_filtrados, metadata)
    """
    catalog = catalog_total if catalog_total is not None else len(items)
    detected = detect_planteles_filter(user_message)
    filtered = list(items)

    if detected["city"]:
        filtered = [p for p in filtered if plantel_matches_city(p, str(detected["city"]))]

    if detected["specialty"]:
        filtered = [
            p for p in filtered if plantel_matches_specialty(p, str(detected["specialty"]))
        ]

    is_filtered = len(filtered) < catalog or bool(detected["city"] or detected["specialty"])
    filter_label = detected["specialty"] or detected["city"]

    return filtered, {
        "catalog_total": catalog,
        "filtered": is_filtered and len(filtered) < catalog,
        "filter_label": filter_label,
        "show_all": not is_filtered or len(filtered) >= catalog,
    }


def slim_plantel_for_map(plantel: dict[str, Any]) -> dict[str, Any]:
    """Campos mínimos para mapa y detalle."""
    return {
        "id": plantel.get("id"),
        "nombre": plantel.get("nombre"),
        "municipio": plantel.get("municipio"),
        "direccion": plantel.get("direccion"),
        "telefono": plantel.get("telefono"),
        "email": plantel.get("email"),
        "lat": plantel.get("lat"),
        "lng": plantel.get("lng"),
        "especialidades": plantel.get("especialidades"),
        "equipamiento": plantel.get("equipamiento"),
        "horario": plantel.get("horario"),
    }

"""
Detección de intenciones conversacionales: saludo, menú y ayuda general.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Any

MAIN_MENU_OPTIONS: tuple[dict[str, str], ...] = (
    {
        "id": "courses",
        "icon": "📚",
        "title": "Mis cursos inscritos",
        "example": "¿Cuántos cursos tengo inscritos?",
    },
    {
        "id": "progress",
        "icon": "📈",
        "title": "Avance en un curso",
        "example": "¿Cuál es mi progreso en el curso de Yaskawa?",
    },
    {
        "id": "certificates",
        "icon": "🏅",
        "title": "Certificados",
        "example": "¿Cuáles son mis certificados?",
    },
    {
        "id": "events",
        "icon": "📅",
        "title": "Eventos y avisos",
        "example": "¿Hay algún evento esta semana?",
    },
    {
        "id": "campus",
        "icon": "📍",
        "title": "Sedes IECA",
        "example": "¿Dónde están las sedes del campus?",
    },
    {
        "id": "invoices",
        "icon": "🧾",
        "title": "Facturas y pagos",
        "example": "Historial de pagos",
    },
    {
        "id": "profile",
        "icon": "👤",
        "title": "Mi perfil",
        "example": "¿Cuál es mi perfil?",
    },
    {
        "id": "catalog",
        "icon": "🔍",
        "title": "Catálogo de cursos",
        "example": "¿Qué cursos de automatización hay disponibles?",
    },
)


def normalize_text(text: str) -> str:
    """Normaliza texto para comparación."""
    normalized = unicodedata.normalize("NFD", text or "")
    stripped = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    return stripped.lower().strip()


def is_greeting(user_message: str) -> bool:
    """True si el mensaje es principalmente un saludo."""
    text = normalize_text(user_message)
    if not text or len(text) > 90:
        return False

    greetings = (
        "hola",
        "holi",
        "hey",
        "buenos dias",
        "buen dia",
        "buenas tardes",
        "buenas noches",
        "que tal",
        "saludos",
        "buenas",
    )
    cleaned = re.sub(r"[^\w\s]", "", text).strip()
    if cleaned in greetings:
        return True

    for greeting in greetings:
        if cleaned.startswith(greeting) and len(cleaned) <= len(greeting) + 20:
            remainder = cleaned[len(greeting) :].strip()
            if not remainder or remainder in ("como estas", "que tal", "asistente"):
                return True
    return False


def is_menu_request(user_message: str) -> bool:
    """True si pide menú, ayuda u opciones disponibles."""
    text = normalize_text(user_message)
    patterns = (
        r"\b(menu|opciones|ayuda|help)\b",
        r"\bque puedes hacer\b",
        r"\bque sabes hacer\b",
        r"\bcomo me puedes ayudar\b",
        r"\ben que me ayudas\b",
    )
    return any(re.search(pat, text) for pat in patterns)


from app.agents.announcement_timeframe import is_event_question


def is_announcements_query(user_message: str) -> bool:
    """
    True si la pregunta trata avisos, eventos, promociones o actividades del campus.

    Ejemplos: «¿Qué actividades hay este mes?», «próximo evento», «mis avisos».
    """
    text = normalize_text(user_message)
    if not text:
        return False

    if is_event_question(user_message):
        return True

    patterns = (
        r"\baviso",
        r"\bpromoc",
        r"\bnoticia",
        r"\bconvocatoria",
    )
    return any(re.search(pat, text) for pat in patterns)


def is_learning_paths_query(user_message: str) -> bool:
    """
    True si la pregunta trata rutas/trayectorias de aprendizaje, no el perfil general.

    Ejemplos: «¿En qué ruta debo continuar mis estudios?», «mis rutas de aprendizaje».
    """
    text = normalize_text(user_message)
    if not text:
        return False

    profile_only = (
        r"\b(mi perfil|perfil academico|datos personales|matricula|horas acumuladas)\b",
    )
    if any(re.search(pat, text) for pat in profile_only):
        return False

    patterns = (
        r"\bruta\b",
        r"\btrayectoria\b",
        r"\bcontinuar mis estudios\b",
        r"\bcontinuar estudiando\b",
        r"\bque estudiar\b",
        r"\bque especializacion\b",
        r"\bpath de aprendizaje\b",
        r"\brutas de aprendizaje\b",
        r"\bplan de estudios\b",
    )
    return any(re.search(pat, text) for pat in patterns)


def should_show_main_menu(user_message: str, payload: dict[str, Any] | None) -> bool:
    """
    Decide si mostrar menú principal en lugar de un payload genérico o vacío.

    No reemplaza respuestas sustantivas (perfil, detalle de curso, etc.).
    """
    if not (is_greeting(user_message) or is_menu_request(user_message)):
        return False
    if payload is None:
        return True
    payload_type = payload.get("type")
    return payload_type in (None, "enrolled_courses", "main_menu")


def build_main_menu_payload() -> dict[str, Any]:
    """Payload UI con opciones del asistente educativo."""
    return {
        "type": "main_menu",
        "data": {
            "options": list(MAIN_MENU_OPTIONS),
            "title": "¿En qué te ayudo hoy?",
        },
    }

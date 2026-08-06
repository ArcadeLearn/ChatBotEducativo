"""
Utilidades para detectar preguntas sobre un curso específico y filtrar datos MCP.
"""

import re
import unicodedata
from typing import Any

# Palabras vacías en español para matching de títulos
_STOPWORDS = frozenset({
    "el", "la", "los", "las", "de", "del", "en", "mi", "mis", "un", "una",
    "curso", "cursos", "progreso", "avance", "como", "cuál", "cual", "que",
    "qué", "esta", "este", "estoy", "tengo", "sobre", "para", "con", "y",
})


def normalize_text(value: str) -> str:
    """Normaliza texto para comparación (minúsculas, sin acentos)."""
    lowered = value.lower().strip()
    normalized = unicodedata.normalize("NFD", lowered)
    return "".join(c for c in normalized if unicodedata.category(c) != "Mn")


def extract_query_keywords(user_message: str) -> list[str]:
    """
    Extrae palabras clave del mensaje del alumno para buscar un curso.

    Args:
        user_message: Pregunta del usuario.

    Returns:
        Lista de tokens significativos (>= 3 chars, no stopwords).
    """
    text = normalize_text(user_message)
    # Patrones típicos: "curso de Yaskawa", "progreso en el curso de X"
    for pattern in (
        r"curso de ([\w\s]+)",
        r"progreso en (?:el )?(?:curso de )?([\w\s]+)",
        r"avance en (?:el )?(?:curso de )?([\w\s]+)",
    ):
        match = re.search(pattern, text)
        if match:
            text = match.group(1)

    tokens = re.findall(r"[a-z0-9]+", text)
    return [t for t in tokens if len(t) >= 3 and t not in _STOPWORDS]


def is_specific_course_query(user_message: str) -> bool:
    """True si el mensaje parece preguntar por un curso concreto."""
    msg = normalize_text(user_message)
    patterns = (
        "curso de",
        "progreso en",
        "avance en",
        "modulo",
        "modulos",
        "leccion",
        "yaskawa",
        "kuka",
        "faros",
        "faro",
        "ingles",
        "prompt engineering",
    )
    return any(p in msg for p in patterns)


def match_course_from_query(
    courses: list[dict[str, Any]],
    user_message: str,
) -> dict[str, Any] | None:
    """
    Encuentra el curso que mejor coincide con la pregunta del alumno.

    Args:
        courses: Lista de cursos inscritos.
        user_message: Pregunta del usuario.

    Returns:
        Curso coincidente o None.
    """
    if not courses or not user_message.strip():
        return None

    keywords = extract_query_keywords(user_message)
    if not keywords:
        return None

    best: dict[str, Any] | None = None
    best_score = 0

    for course in courses:
        title = normalize_text(str(course.get("title", "")))
        description = normalize_text(str(course.get("description", "")))
        haystack = f"{title} {description}"
        score = sum(1 for kw in keywords if kw in haystack)
        if score > best_score:
            best_score = score
            best = course

    return best if best_score > 0 else None

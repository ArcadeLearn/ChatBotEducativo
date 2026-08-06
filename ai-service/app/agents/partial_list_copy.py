"""
Generación de texto introductorio inteligente para listas parciales en Rich UI.
Combina total de registros vs. cantidad mostrada (MAX_UI_CARDS) y la intención de la pregunta.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal

from app.settings import get_max_ui_cards

QuestionFocus = Literal["count", "recent", "search", "general"]

_FOCUS_BY_KIND: dict[str, tuple[str, ...]] = {
    "certificates": ("certificado", "constancia", "diploma", "acreditaci"),
    "enrolled_courses": ("curso", "inscri", "materia", "clase"),
    "course_catalog": ("curso", "catálogo", "catalogo", "busca", "disponible"),
    "learning_paths": ("ruta", "trayectoria", "especialidad", "carrera"),
    "announcements": ("aviso", "evento", "promoci", "noticia"),
    "planteles": ("plantel", "sede", "campus", "ubicaci"),
    "invoices": ("factura", "pago", "recibo", "cobro"),
}


@dataclass(frozen=True)
class ListCounts:
    """Conteos de una lista parcial para intro y tarjetas."""

    total: int
    shown: int
    hidden: int
    is_partial: bool


def compute_list_counts(items_count: int, total: int | None = None) -> ListCounts:
    """
    Calcula total, mostrados y restantes según MAX_UI_CARDS.

    Args:
        items_count: Ítems disponibles en el payload visible.
        total: Total real si difiere (p. ej. catálogo filtrado).

    Returns:
        ListCounts con bandera is_partial.
    """
    limit = get_max_ui_cards()
    resolved_total = max(int(total or items_count), items_count)
    shown = min(limit, items_count)
    hidden = max(0, resolved_total - shown)
    return ListCounts(total=resolved_total, shown=shown, hidden=hidden, is_partial=hidden > 0)


def detect_question_focus(user_message: str, kind: str) -> QuestionFocus:
    """
    Infiere la intención principal de la pregunta del alumno.

    Args:
        user_message: Pregunta original.
        kind: Tipo de payload UI.

    Returns:
        Enfoque: count | recent | search | general.
    """
    query = (user_message or "").lower()
    if any(
        token in query
        for token in ("cuántos", "cuantos", "cuántas", "cuantas", "total", "número", "numero", "cantidad")
    ):
        return "count"
    if any(token in query for token in ("reciente", "recientes", "últim", "ultim", "nuevo", "nueva", "historial")):
        return "recent"
    if any(
        token in query
        for token in ("busca", "buscar", "encuentra", "encontrar", "hay", "disponible", "catálogo", "catalogo")
    ):
        return "search"
    if kind == "course_catalog" and "search" not in query:
        return "search"
    keywords = _FOCUS_BY_KIND.get(kind, ())
    if keywords and not any(keyword in query for keyword in keywords):
        return "general"
    return "general"


def build_context_line(
    kind: str,
    counts: ListCounts,
    greeting: str,
    focus: QuestionFocus,
    extras: dict[str, Any],
) -> str:
    """Párrafo 1: contexto con total y métricas relevantes."""
    total = counts.total

    if kind == "certificates":
        if focus == "count":
            return (
                f"{greeting} Has acumulado **{total} certificados y constancias** "
                "acreditadas en Campus IECA."
            )
        if focus == "recent":
            return (
                f"{greeting} Este es el resumen de tus acreditaciones; "
                f"en total llevas **{total} certificados** obtenidos."
            )
        return f"{greeting} Tienes **{total} certificados y constancias acreditadas**."

    if kind == "enrolled_courses":
        avg = extras.get("average_progress")
        avg_suffix = f" con un progreso promedio del **{avg}%**" if avg is not None else ""
        if focus == "count":
            return f"{greeting} Actualmente tienes **{total} cursos inscritos**{avg_suffix}."
        return f"{greeting} Tienes **{total} cursos inscritos**{avg_suffix}."

    if kind == "course_catalog":
        if focus == "search":
            return f"{greeting} Encontramos **{total} cursos** que coinciden con tu búsqueda."
        return f"{greeting} Hay **{total} cursos** disponibles en el catálogo de Campus IECA."

    if kind == "learning_paths":
        if focus == "count":
            return f"En Campus IECA existen **{total} rutas de aprendizaje** para tu perfil."
        return f"En Campus IECA hay **{total} rutas de aprendizaje** disponibles."

    if kind == "announcements":
        return f"Estos son los avisos actuales del campus: **{total}** en total."

    if kind == "planteles":
        return f"Campus IECA cuenta con **{total} planteles** en la red estatal."

    if kind == "invoices":
        return f"Tienes **{total} registros** de facturación y pagos en tu cuenta."

    return f"{greeting} Encontramos **{total} resultados**."


def build_cta_line(kind: str, counts: ListCounts, focus: QuestionFocus) -> str:
    """Párrafo 2: invitación a ver las tarjetas, jugando total vs. mostrados."""
    total = counts.total
    shown = counts.shown

    if kind == "certificates":
        if counts.is_partial:
            if focus == "recent" or focus == "count":
                if total >= 15:
                    return (
                        f"De tus **{total}** acreditaciones, aquí te presentamos "
                        f"las **{shown}** más recientes:"
                    )
                return f"Aquí te presentamos **{shown}** de tus **{total}** certificados más recientes:"
            return f"Aquí te presentamos los **{shown} certificados más recientes** (de **{total}** en total):"
        if shown == 1:
            return "Aquí tienes tu certificado más reciente:"
        return f"Aquí tienes tus **{shown} certificados**, del más reciente al más antiguo:"

    if kind == "enrolled_courses":
        if counts.is_partial:
            if total >= 20:
                return (
                    f"De tus **{total}** cursos inscritos, aquí te mostramos **{shown}** "
                    "con avance más relevante para que elijas por dónde continuar:"
                )
            return (
                f"Aquí te presentamos **{shown}** de tus **{total}** cursos activos "
                "para que decidas por dónde continuar:"
            )
        return "Aquí tienes tus cursos activos para que decidas por dónde continuar:"

    if kind == "course_catalog":
        if counts.is_partial:
            if total >= 20:
                return (
                    f"Del catálogo de **{total}** cursos, aquí te presentamos **{shown}** "
                    "opciones destacadas:"
                )
            return f"Aquí presentamos **{shown}** de los **{total}** cursos encontrados:"
        return "Aquí tienes el detalle visual de los cursos encontrados:"

    if kind == "learning_paths":
        if counts.is_partial:
            return (
                f"De las **{total}** rutas disponibles, aquí te presentamos **{shown}** "
                "para que explores tus opciones:"
            )
        return "Aquí tienes el detalle visual de cada ruta:"

    if kind == "announcements":
        if counts.is_partial:
            return f"Aquí presentamos los **{shown} avisos más recientes** (de **{total}** en total):"
        return "Aquí tienes los avisos más recientes del campus:"

    if kind == "planteles":
        return (
            f"Aquí tienes el **mapa de Guanajuato** con las **{total} sedes IECA** "
            "geolocalizadas y la lista completa:"
        )

    if kind == "invoices":
        if counts.is_partial:
            return f"Aquí presentamos tus **{shown}** movimientos más recientes (de **{total}** en total):"
        return "Aquí tienes el detalle de tus facturas y pagos:"

    if counts.is_partial:
        return f"Aquí te presentamos **{shown}** de **{total}** resultados:"
    return "Aquí tienes el detalle visual:"


def enrich_context_with_total(context: str, kind: str, counts: ListCounts, extras: dict[str, Any]) -> str:
    """Añade el total al contexto del LLM si la pregunta lo requiere y falta."""
    if str(counts.total) in context:
        return context

    total = counts.total
    if kind == "certificates":
        metric = f"En total llevas **{total} certificados acreditados**"
    elif kind == "enrolled_courses":
        avg = extras.get("average_progress")
        avg_suffix = f" con promedio del **{avg}%**" if avg is not None else ""
        metric = f"Actualmente tienes **{total} cursos inscritos**{avg_suffix}"
    elif kind == "course_catalog":
        metric = f"Encontramos **{total} cursos** disponibles"
    elif kind == "learning_paths":
        metric = f"Hay **{total} rutas de aprendizaje** disponibles"
    elif kind == "announcements":
        metric = f"Hay **{total} avisos** en el campus"
    else:
        metric = f"En total hay **{total}** registros"

    return f"{context.rstrip('.')}. {metric}."


def build_list_intro(
    *,
    kind: str,
    counts: ListCounts,
    llm_text: str,
    user_message: str = "",
    greeting: str = "¡Hola!",
    extras: dict[str, Any] | None = None,
    needs_template: bool,
) -> str:
    """
    Ensambla intro de dos párrafos: contexto + invitación a tarjetas.

    Args:
        kind: Tipo de lista (certificates, enrolled_courses, etc.).
        counts: Conteos total/mostrados.
        llm_text: Texto crudo del LLM ya recortado.
        user_message: Pregunta original del alumno.
        greeting: Saludo personalizado.
        extras: Métricas adicionales (promedio, etc.).
        needs_template: Si True, ignora párrafo del LLM y usa plantilla.

    Returns:
        Texto introductorio final.
    """
    extras = extras or {}
    focus = detect_question_focus(user_message, kind)

    if needs_template:
        context = build_context_line(kind, counts, greeting, focus, extras)
    else:
        context = llm_text.strip().split("\n\n")[0].strip()
        if focus == "count":
            context = enrich_context_with_total(context, kind, counts, extras)

    cta = build_cta_line(kind, counts, focus)
    return f"{context.rstrip('.')}.\n\n{cta}"

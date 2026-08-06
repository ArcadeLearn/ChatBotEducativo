"""

Formatea la respuesta del LLM cuando hay payload UI rico.

Evita duplicar en texto lo que ya muestran las tarjetas visuales.

"""



import re

from typing import Any



from app.agents.announcement_timeframe import build_announcements_intro
from app.agents.partial_list_copy import build_list_intro, compute_list_counts

from app.settings import get_max_ui_cards



RICH_UI_TYPES = frozenset({

    "certificates",

    "enrolled_courses",

    "course_detail",

    "course_catalog",

    "announcements",

    "student_stats",

    "student_profile",

    "learning_paths",

    "planteles",

    "invoices",

})



_LIST_START = re.compile(

    r"^(\d+[\.\)]\s+|[-*•]\s+\*\*|[-*•]\s+[A-Z])",

    re.MULTILINE,

)

_DETAIL_LINE = re.compile(

    r"(fecha de acreditaci[oó]n|calificaci[oó]n:|folio:|progreso:|m[oó]dulo \d|"

    r"lecci[oó]n \d|precio:|rating:|\*\*precio|completado|pendiente|"

    r"lecciones completadas|actividades|/\d+\)|\*\*m[oó]dulo)",

    re.IGNORECASE,

)





def format_response_for_ui(

    text: str,

    payload: dict[str, Any] | None,

    user_message: str = "",

) -> str:

    """

    Recorta respuesta textual cuando el frontend renderizará tarjetas.



    Args:

        text: Respuesta cruda del LLM.

        payload: Payload UI { type, data } o None.

        user_message: Pregunta original para adaptar el tono de la intro.



    Returns:

        Texto introductorio sin listados duplicados.

    """

    if not payload or payload.get("type") not in RICH_UI_TYPES:

        return text.strip()



    payload_type = payload["type"]

    trimmed = _trim_before_list(text)



    if payload_type == "certificates":

        return _ensure_certificates_intro(trimmed, payload, user_message)



    if payload_type == "course_detail":

        return _ensure_course_detail_intro(trimmed, payload)



    if payload_type == "student_profile":

        return _ensure_student_profile_intro(trimmed, payload)



    if payload_type == "learning_paths":

        return _ensure_learning_paths_intro(trimmed, payload, user_message)



    if payload_type == "enrolled_courses":

        return _ensure_enrolled_courses_intro(trimmed, payload, user_message)



    if payload_type == "course_catalog":

        return _ensure_course_catalog_intro(trimmed, payload, user_message)



    if payload_type == "announcements":

        return _ensure_announcements_intro(trimmed, payload, user_message)



    if payload_type == "planteles":

        return _ensure_planteles_intro(trimmed, payload, user_message)



    if payload_type == "invoices":

        return _ensure_invoices_intro(trimmed, payload, user_message)



    return _keep_short_intro(trimmed, max_chars=400)





def _trim_before_list(text: str) -> str:

    """Conserva solo párrafos previos al primer listado detallado."""

    lines = text.split("\n")

    kept: list[str] = []

    for line in lines:

        stripped = line.strip()

        if stripped in ("---", "***", "___"):

            break

        if _LIST_START.match(stripped):

            break

        if _DETAIL_LINE.search(stripped) and kept:

            break

        kept.append(line)

    result = "\n".join(kept).strip()

    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", result) if p.strip()]

    if len(paragraphs) > 2:

        paragraphs = paragraphs[:2]

    return "\n\n".join(paragraphs)





def _truncate_at_sentence(text: str, max_chars: int) -> str:

    """Recorta preferiendo el final de oración completa dentro del límite."""

    text = text.strip()

    if len(text) <= max_chars:

        return text

    chunk = text[:max_chars]

    for sep in (". ", "! ", "? ", ".\n", "!\n", "?\n"):

        idx = chunk.rfind(sep)

        if idx >= int(max_chars * 0.45):

            return chunk[: idx + 1].strip()

    cut = chunk.rsplit(" ", 1)[0].rstrip(",;:")

    return f"{cut}."





def _keep_short_intro(text: str, max_chars: int = 320) -> str:

    """Limita la intro a un tamaño breve sin cortar a mitad de palabra."""

    return _truncate_at_sentence(text, max_chars)





def _extract_greeting(text: str) -> str:

    """Extrae saludo con nombre del texto del LLM si existe."""

    match = re.search(

        r"(?:Hola,?\s+)([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)",

        text or "",

    )

    return f"¡Hola, {match.group(1)}!" if match else "¡Hola!"





def _needs_template_intro(text: str) -> bool:

    """True si conviene reemplazar el texto del LLM por plantilla estructurada."""

    return (

        not text

        or len(text) > 280

        or bool(_DETAIL_LINE.search(text))

        or bool(_LIST_START.search(text))

    )





def _list_intro(

    kind: str,

    payload: dict[str, Any],

    text: str,

    user_message: str,

    *,

    total_key: str,

    items_key: str,

    extras: dict[str, Any] | None = None,

) -> str:

    """Helper común para intros de listas parciales."""

    data = payload.get("data") or {}

    items = data.get(items_key) or []

    total = int(data.get(total_key) or data.get("total") or len(items))

    counts = compute_list_counts(len(items), total)

    return build_list_intro(

        kind=kind,

        counts=counts,

        llm_text=text,

        user_message=user_message,

        greeting=_extract_greeting(text),

        extras=extras or {},

        needs_template=_needs_template_intro(text),

    )





def _ensure_certificates_intro(text: str, payload: dict[str, Any], user_message: str) -> str:

    """Intro breve para certificados: total acumulado + N más recientes en tarjetas."""

    return _list_intro(

        "certificates",

        payload,

        text,

        user_message,

        total_key="total",

        items_key="certificates",

    )





def _ensure_enrolled_courses_intro(text: str, payload: dict[str, Any], user_message: str) -> str:

    """Intro breve para cursos inscritos con total vs. mostrados."""

    data = payload.get("data") or {}

    summary = data.get("summary") or {}

    return _list_intro(

        "enrolled_courses",

        payload,

        text,

        user_message,

        total_key="total",

        items_key="courses",

        extras={"average_progress": summary.get("average_progress")},

    )





def _ensure_course_catalog_intro(text: str, payload: dict[str, Any], user_message: str) -> str:

    """Intro breve para catálogo de cursos."""

    return _list_intro(

        "course_catalog",

        payload,

        text,

        user_message,

        total_key="total",

        items_key="courses",

    )





def _ensure_learning_paths_intro(text: str, payload: dict[str, Any], user_message: str) -> str:

    """Intro breve para rutas de aprendizaje."""

    return _list_intro(

        "learning_paths",

        payload,

        text,

        user_message,

        total_key="total",

        items_key="paths",

    )





def _ensure_announcements_intro(text: str, payload: dict[str, Any], user_message: str) -> str:

    """Intro breve para avisos/eventos con lógica temporal inteligente."""

    data = payload.get("data") or {}

    items = data.get("announcements") or []

    total = int(data.get("total") or len(items))

    counts = compute_list_counts(len(items), total)



    if data.get("timeframe") and data.get("timeframe") != "all":

        return build_announcements_intro(

            data=data,

            greeting=_extract_greeting(text),

            counts=counts,

            llm_text=text,

            needs_template=_needs_template_intro(text),

        )



    return _list_intro(

        "announcements",

        payload,

        text,

        user_message,

        total_key="total",

        items_key="announcements",

    )





def _ensure_planteles_intro(text: str, payload: dict[str, Any], user_message: str) -> str:

    """Intro breve para planteles: total red vs. búsqueda filtrada."""

    data = payload.get("data") or {}
    total = int(data.get("total") or len(data.get("planteles") or []))
    catalog_total = int(data.get("catalog_total") or total)
    filtered = bool(data.get("filtered"))
    filter_label = data.get("filter_label")
    greeting = _extract_greeting(text)

    if filtered and total < catalog_total:
        noun = "plantel" if total == 1 else "planteles"
        context = f"{greeting} Encontramos **{total} {noun}**"
        if filter_label:
            context += f" con especialidad en **{filter_label}**"
        context += f" (de **{catalog_total}** en la red IECA)."
        cta = (
            "Aquí lo tienes en el mapa:"
            if total == 1
            else f"Aquí tienes los **{total}** planteles encontrados en el mapa:"
        )
        return f"{context}\n\n{cta}"

    context = f"{greeting} Campus IECA cuenta con **{catalog_total} planteles** en la red estatal."
    cta = (
        f"Aquí tienes el **mapa de Guanajuato** con las **{catalog_total} sedes** "
        "geolocalizadas y la lista completa:"
    )
    return f"{context}\n\n{cta}"





def _ensure_invoices_intro(text: str, payload: dict[str, Any], user_message: str) -> str:

    """Intro breve para facturas y pagos."""

    return _list_intro(

        "invoices",

        payload,

        text,

        user_message,

        total_key="total",

        items_key="invoices",

    )





def _ensure_course_detail_intro(text: str, payload: dict[str, Any]) -> str:

    """Intro breve para progreso de un curso específico."""

    course = payload.get("data") or {}

    title = course.get("title", "tu curso")

    progress = course.get("progressPercentage", 0)

    name_match = re.search(r"(?:Hola,?\s+)([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)", text)



    if not text or _DETAIL_LINE.search(text):

        greeting = f"Hola, {name_match.group(1)}." if name_match else "Hola."

        return (

            f"{greeting} Este es tu avance en **{title}** "

            f"(**{progress}%** de progreso general).\n\n"

            "Aquí tienes el detalle visual por módulos y actividades:"

        )



    trimmed = _keep_short_intro(text, max_chars=280)

    if "detalle" not in trimmed.lower() and "módulo" not in trimmed.lower():

        trimmed = (

            f"{trimmed.rstrip()}\n\n"

            "Aquí tienes el detalle visual por módulos y actividades:"

        )

    return trimmed.strip()





def _ensure_student_profile_intro(text: str, payload: dict[str, Any]) -> str:

    """Intro breve para tarjeta de perfil."""

    data = payload.get("data") or {}

    name = data.get("name", "alumno")

    hours = data.get("completedHours")



    if not text or _DETAIL_LINE.search(text) or len(text) > 350:

        base = f"¡Hola, **{name}**! Este es tu perfil en Campus IECA."

        if hours is not None:

            base += f" Llevas **{hours} horas** de formación acumuladas."

        return f"{base}\n\nAquí tienes tu resumen visual:"



    trimmed = _keep_short_intro(text, max_chars=220)

    if "resumen visual" not in trimmed.lower():

        trimmed = f"{trimmed.rstrip()}\n\nAquí tienes tu resumen visual:"

    return trimmed.strip()



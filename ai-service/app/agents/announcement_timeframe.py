"""
Utilidades para filtrar avisos/eventos por marco temporal según la pregunta del alumno.
Usa la fecha/hora actual (America/Mexico_City) como referencia de día, mes y año.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Any, Literal
from zoneinfo import ZoneInfo

Timeframe = Literal[
    "today",
    "tomorrow",
    "this_weekend",
    "this_week",
    "next_week",
    "this_month",
    "next_month",
    "specific_month",
    "next",
    "all",
]
Scope = Literal["matched", "upcoming_fallback", "all"]

TZ = ZoneInfo("America/Mexico_City")

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
_MONTH_NAMES = {v: k for k, v in _SPANISH_MONTHS.items()}

_SINGLE_DATE = re.compile(
    r"(\d{1,2})\s+de\s+(\w+),?\s*(\d{4})",
    re.IGNORECASE,
)
_RANGE_DATE = re.compile(
    r"(\d{1,2})\s+y\s+(\d{1,2})\s+de\s+(\w+),?\s*(\d{4})",
    re.IGNORECASE,
)
_MONTH_IN_QUERY = re.compile(
    r"\b(?:en|para|del|de)\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|"
    r"septiembre|octubre|noviembre|diciembre)(?:\s+de\s+(\d{4}))?\b",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class DateContext:
    """Instante de referencia de la consulta (zona México)."""

    now: datetime
    today: date
    year: int
    month: int
    month_name: str
    week_start: date
    week_end: date
    month_start: date
    month_end: date

    @property
    def reference_label(self) -> str:
        """Etiqueta legible del día de la consulta."""
        return format_spanish_date(self.today)

    @property
    def week_label(self) -> str:
        """Rango legible de la semana actual (lun–dom)."""
        return format_date_range(self.week_start, self.week_end)

    @property
    def month_label(self) -> str:
        """Etiqueta legible del mes actual."""
        return f"{self.month_name} de {self.year}"


@dataclass(frozen=True)
class TimeframeQuery:
    """Marco temporal detectado en la pregunta."""

    kind: Timeframe
    target_month: int | None = None
    target_year: int | None = None

    @property
    def period_label(self) -> str | None:
        """Etiqueta del periodo pedido, si aplica."""
        if self.kind == "specific_month" and self.target_month:
            month_name = _MONTH_NAMES[self.target_month]
            year = self.target_year or date.today().year
            return f"{month_name} de {year}"
        return None


@dataclass(frozen=True)
class TimeframeFilterResult:
    """Resultado del filtro temporal sobre avisos."""

    items: list[dict[str, Any]]
    timeframe: Timeframe
    scope: Scope
    matched_total: int
    filter_type: str | None
    date_context: DateContext
    query: TimeframeQuery
    period_label: str


def reference_now() -> datetime:
    """Momento actual en zona horaria de México."""
    return datetime.now(TZ)


def reference_today() -> date:
    """Fecha de referencia en zona horaria de México."""
    return reference_now().date()


def build_date_context(at: datetime | None = None) -> DateContext:
    """
    Construye contexto de fechas anclado al momento de la consulta.

    Args:
        at: Datetime opcional (tests); default = ahora en México.

    Returns:
        DateContext con día, mes, año y rangos semanales/mensuales.
    """
    now = at or reference_now()
    today = now.date()
    week_start, week_end = _week_bounds(today)
    month_start = today.replace(day=1)
    month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
    return DateContext(
        now=now,
        today=today,
        year=today.year,
        month=today.month,
        month_name=_MONTH_NAMES[today.month],
        week_start=week_start,
        week_end=week_end,
        month_start=month_start,
        month_end=month_end,
    )


def format_spanish_date(value: date) -> str:
    """Formatea fecha como '5 de agosto de 2026'."""
    return f"{value.day} de {_MONTH_NAMES[value.month]} de {value.year}"


def format_date_range(start: date, end: date) -> str:
    """Formatea rango de fechas en español."""
    if start == end:
        return format_spanish_date(start)
    if start.year == end.year and start.month == end.month:
        return f"{start.day} al {end.day} de {_MONTH_NAMES[start.month]} de {start.year}"
    if start.year == end.year:
        return (
            f"{start.day} de {_MONTH_NAMES[start.month]} al "
            f"{end.day} de {_MONTH_NAMES[end.month]} de {start.year}"
        )
    return f"{format_spanish_date(start)} al {format_spanish_date(end)}"


def detect_announcement_timeframe(user_message: str, ctx: DateContext | None = None) -> TimeframeQuery:
    """
    Detecta marco temporal pedido en la pregunta usando el contexto actual.

    Args:
        user_message: Pregunta original del alumno.
        ctx: Contexto de fecha; default = ahora.

    Returns:
        TimeframeQuery con tipo y mes/año objetivo si aplica.
    """
    ctx = ctx or build_date_context()
    query = (user_message or "").lower()

    if re.search(r"\bhoy\b|\bpara hoy\b|\bel día de hoy\b", query):
        return TimeframeQuery(kind="today")
    if re.search(r"\bmañana\b|\bpara mañana\b", query):
        return TimeframeQuery(kind="tomorrow")
    if re.search(r"\beste fin de semana\b|\bfin de semana\b", query):
        return TimeframeQuery(kind="this_weekend")
    if any(token in query for token in ("esta semana", "está semana", "de la semana")):
        return TimeframeQuery(kind="this_week")
    if re.search(r"\bpróxima semana\b|\bproxima semana\b|\bla semana que viene\b", query):
        return TimeframeQuery(kind="next_week")
    if any(token in query for token in ("este mes", "del mes", "en el mes", "actividades este mes")):
        return TimeframeQuery(kind="this_month")
    if re.search(r"\bpróximo mes\b|\bproximo mes\b|\bel mes que viene\b", query):
        return TimeframeQuery(kind="next_month")
    if any(
        token in query
        for token in ("próximo evento", "proximo evento", "siguiente evento", "cuándo es", "cuando es")
    ):
        return TimeframeQuery(kind="next")

    month_match = _MONTH_IN_QUERY.search(query)
    if month_match:
        month_name = month_match.group(1).lower()
        year_str = month_match.group(2)
        return TimeframeQuery(
            kind="specific_month",
            target_month=_SPANISH_MONTHS.get(month_name),
            target_year=int(year_str) if year_str else ctx.year,
        )

    return TimeframeQuery(kind="all")


def is_event_question(user_message: str) -> bool:
    """True si la pregunta se refiere a eventos."""
    query = (user_message or "").lower()
    return any(
        token in query
        for token in ("evento", "eventos", "hackathon", "simposio", "ceremonia", "actividades")
    )


def parse_announcement_dates(date_str: str, *, reference: date | None = None) -> list[date]:
    """
    Parsea el campo date de un aviso a fechas concretas.

    Args:
        date_str: Texto de fecha del aviso.
        reference: Fecha de consulta para inferir año si falta.

    Returns:
        Lista de fechas; vacía si no es parseable.
    """
    text = (date_str or "").strip()
    if not text:
        return []

    reference = reference or reference_today()
    relative = text.lower()
    if "esta semana" in relative or "válido esta semana" in relative:
        week_start, week_end = _week_bounds(reference)
        return [week_start, week_end]
    if "este mes" in relative or "vigencia de verano" in relative:
        month_start = reference.replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        return [month_start, month_end]

    range_match = _RANGE_DATE.search(text)
    if range_match:
        day1, day2, month_name, year = range_match.groups()
        month = _SPANISH_MONTHS.get(month_name.lower())
        if month:
            return [
                date(int(year), month, int(day1)),
                date(int(year), month, int(day2)),
            ]

    dates: list[date] = []
    for match in _SINGLE_DATE.finditer(text):
        day, month_name, year = match.groups()
        month = _SPANISH_MONTHS.get(month_name.lower())
        if month:
            dates.append(date(int(year), month, int(day)))
    return dates


def _event_sort_key(item: dict[str, Any], reference: date | None = None) -> date:
    """Fecha mínima del evento para ordenar cronológicamente."""
    parsed = parse_announcement_dates(str(item.get("date", "")), reference=reference)
    return min(parsed) if parsed else date.max


def _week_bounds(day: date) -> tuple[date, date]:
    """Lunes a domingo de la semana que contiene day."""
    monday = day - timedelta(days=day.weekday())
    return monday, monday + timedelta(days=6)


def _weekend_bounds(day: date) -> tuple[date, date]:
    """Sábado y domingo de la semana que contiene day."""
    monday = day - timedelta(days=day.weekday())
    saturday = monday + timedelta(days=5)
    return saturday, saturday + timedelta(days=1)


def _event_intersects_range(item: dict[str, Any], start: date, end: date, reference: date) -> bool:
    """True si alguna fecha del evento cae en el rango [start, end]."""
    for event_date in parse_announcement_dates(str(item.get("date", "")), reference=reference):
        if start <= event_date <= end:
            return True
    return False


def _future_events(items: list[dict[str, Any]], today: date) -> list[dict[str, Any]]:
    """Eventos con fecha hoy o futura, ordenados por proximidad."""
    upcoming: list[dict[str, Any]] = []
    for item in items:
        parsed = parse_announcement_dates(str(item.get("date", "")), reference=today)
        if parsed and max(parsed) >= today:
            upcoming.append(item)
    return sorted(upcoming, key=lambda item: _event_sort_key(item, today))


def _resolve_period_bounds(query: TimeframeQuery, ctx: DateContext) -> tuple[date, date, str]:
    """
    Calcula rango de fechas y etiqueta legible del periodo pedido.

    Returns:
        (start, end, period_label)
    """
    if query.kind == "today":
        return ctx.today, ctx.today, format_spanish_date(ctx.today)
    if query.kind == "tomorrow":
        tomorrow = ctx.today + timedelta(days=1)
        return tomorrow, tomorrow, format_spanish_date(tomorrow)
    if query.kind == "this_weekend":
        start, end = _weekend_bounds(ctx.today)
        return start, end, f"este fin de semana ({format_date_range(start, end)})"
    if query.kind == "this_week":
        return ctx.week_start, ctx.week_end, f"esta semana ({ctx.week_label})"
    if query.kind == "next_week":
        start = ctx.week_start + timedelta(days=7)
        end = ctx.week_end + timedelta(days=7)
        return start, end, f"la próxima semana ({format_date_range(start, end)})"
    if query.kind == "this_month":
        return ctx.month_start, ctx.month_end, ctx.month_label
    if query.kind == "next_month":
        next_month_start = (ctx.month_start + timedelta(days=32)).replace(day=1)
        next_month_end = (next_month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        label = f"{_MONTH_NAMES[next_month_start.month]} de {next_month_start.year}"
        return next_month_start, next_month_end, label
    if query.kind == "specific_month" and query.target_month:
        year = query.target_year or ctx.year
        month_start = date(year, query.target_month, 1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        label = f"{_MONTH_NAMES[query.target_month]} de {year}"
        return month_start, month_end, label
    return ctx.today, date.max, "el calendario"


def filter_announcements_by_timeframe(
    announcements: list[dict[str, Any]],
    user_message: str,
    *,
    filter_type: str | None = None,
    today: date | None = None,
    at: datetime | None = None,
) -> TimeframeFilterResult:
    """
    Filtra avisos según pregunta temporal, anclado al momento de la consulta.

    Args:
        announcements: Lista cruda de avisos MCP.
        user_message: Pregunta del alumno.
        filter_type: Tipo forzado (evento, promocion, noticia).
        today: Atajo de fecha (tests).
        at: Datetime de referencia (tests).

    Returns:
        TimeframeFilterResult con ítems, scope y etiquetas de periodo.
    """
    ctx = build_date_context(at) if at else build_date_context()
    if today is not None:
        ctx = build_date_context(datetime.combine(today, datetime.min.time(), tzinfo=TZ))

    query = detect_announcement_timeframe(user_message, ctx)
    event_only = is_event_question(user_message)
    resolved_type = filter_type or ("evento" if event_only else None)

    items = list(announcements)
    if resolved_type:
        type_norm = resolved_type.lower()
        items = [item for item in items if str(item.get("type", "")).lower() == type_norm]

    period_start, period_end, period_label = _resolve_period_bounds(query, ctx)

    if query.kind == "all":
        sorted_items = sorted(items, key=lambda item: _event_sort_key(item, ctx.today))
        return TimeframeFilterResult(
            items=sorted_items,
            timeframe="all",
            scope="all",
            matched_total=len(sorted_items),
            filter_type=resolved_type,
            date_context=ctx,
            query=query,
            period_label=period_label,
        )

    if query.kind == "next":
        upcoming = _future_events(items, ctx.today)
        return TimeframeFilterResult(
            items=upcoming[:1],
            timeframe="next",
            scope="matched" if upcoming else "all",
            matched_total=1 if upcoming else 0,
            filter_type=resolved_type,
            date_context=ctx,
            query=query,
            period_label=period_label,
        )

    if resolved_type != "evento" and query.kind not in ("all", "next"):
        return TimeframeFilterResult(
            items=items,
            timeframe=query.kind,
            scope="all",
            matched_total=len(items),
            filter_type=resolved_type,
            date_context=ctx,
            query=query,
            period_label=period_label,
        )

    matched = [
        item
        for item in items
        if _event_intersects_range(item, period_start, period_end, ctx.today)
    ]
    if matched:
        matched.sort(key=lambda item: _event_sort_key(item, ctx.today))
        return TimeframeFilterResult(
            items=matched,
            timeframe=query.kind,
            scope="matched",
            matched_total=len(matched),
            filter_type=resolved_type,
            date_context=ctx,
            query=query,
            period_label=period_label,
        )

    upcoming = _future_events(items, ctx.today)
    return TimeframeFilterResult(
        items=upcoming,
        timeframe=query.kind,
        scope="upcoming_fallback",
        matched_total=0,
        filter_type=resolved_type,
        date_context=ctx,
        query=query,
        period_label=period_label,
    )


def build_announcements_intro(
    *,
    data: dict[str, Any],
    greeting: str,
    counts: Any,
    llm_text: str,
    needs_template: bool,
) -> str:
    """
    Intro contextual para avisos/eventos según marco temporal y fecha de consulta.

    Args:
        data: Payload data con timeframe, scope, period_label y reference_date.
        greeting: Saludo personalizado.
        counts: ListCounts calculado.
        llm_text: Texto del LLM recortado.
        needs_template: Si usar plantilla en lugar del LLM.

    Returns:
        Intro de dos párrafos.
    """
    timeframe = data.get("timeframe", "all")
    scope = data.get("scope", "all")
    filter_type = data.get("filter_type")
    matched_total = int(data.get("matched_total", counts.total))
    shown = counts.shown
    period_label = data.get("period_label", "este periodo")
    reference_label = data.get("reference_date", "")
    is_event = filter_type == "evento"

    today_prefix = f"Hoy es **{reference_label}**. " if reference_label else ""

    if is_event and timeframe != "all" and timeframe != "next":
        if scope == "matched" and matched_total > 0:
            noun = "evento" if matched_total == 1 else "eventos"
            verb = "programado" if matched_total == 1 else "programados"
            context = (
                f"{greeting} {today_prefix}"
                f"Para **{period_label}** hay **{matched_total} {noun}** {verb} en Campus IECA."
            )
            if matched_total == 1:
                cta = "Aquí tienes el evento encontrado:"
            elif shown < matched_total:
                cta = (
                    f"Aquí te presentamos **{shown}** de los **{matched_total}** "
                    f"eventos de {period_label}:"
                )
            else:
                cta = f"Aquí tienes los eventos de {period_label}:"
            return f"{context}\n\n{cta}"

        if scope == "upcoming_fallback":
            context = (
                f"{greeting} {today_prefix}"
                f"No hay eventos programados para **{period_label}**."
            )
            if shown == 1:
                cta = "Este es el **próximo evento** del campus:"
            else:
                cta = f"Pero estos son los **{shown} próximos eventos** a partir de hoy:"
            return f"{context}\n\n{cta}"

        return (
            f"{greeting} {today_prefix}"
            f"No hay eventos programados para {period_label} ni próximos en el calendario."
        )

    if is_event and timeframe == "next":
        if matched_total > 0:
            next_date = data.get("next_event_date")
            date_hint = f" (**{next_date}**)" if next_date else ""
            return (
                f"{greeting} {today_prefix}"
                f"El **próximo evento** del campus{date_hint} es:\n\nAquí tienes el detalle:"
            )
        return f"{greeting} {today_prefix}No hay eventos próximos programados en el calendario."

    from app.agents.partial_list_copy import build_list_intro

    return build_list_intro(
        kind="announcements",
        counts=counts,
        llm_text=llm_text,
        user_message="",
        greeting=greeting,
        extras={"reference_date": reference_label},
        needs_template=needs_template,
    )

"""Tests de filtro temporal de avisos y eventos."""

from datetime import date, datetime
from zoneinfo import ZoneInfo

from app.agents.announcement_timeframe import (
    build_announcements_intro,
    build_date_context,
    detect_announcement_timeframe,
    filter_announcements_by_timeframe,
    format_spanish_date,
    parse_announcement_dates,
)
from app.agents.partial_list_copy import compute_list_counts
from app.agents.payload_builder import _normalize_data
from app.agents.response_formatter import format_response_for_ui

TZ = ZoneInfo("America/Mexico_City")

EVENTS = [
    {
        "id": "aviso-5",
        "title": "Hackathon",
        "type": "evento",
        "date": "15 y 16 de Agosto, 2026",
    },
    {
        "id": "aviso-6",
        "title": "Simposio",
        "type": "evento",
        "date": "08 de Agosto, 2026 • 09:00 AM",
    },
    {
        "id": "aviso-7",
        "title": "Ceremonia",
        "type": "evento",
        "date": "28 de Agosto, 2026",
    },
]


def _ctx_on(day: date):
    return build_date_context(datetime.combine(day, datetime.min.time(), tzinfo=TZ))


def test_parse_single_and_range_dates() -> None:
    assert parse_announcement_dates("08 de Agosto, 2026 • 09:00 AM") == [date(2026, 8, 8)]
    assert parse_announcement_dates("15 y 16 de Agosto, 2026") == [
        date(2026, 8, 15),
        date(2026, 8, 16),
    ]
    assert parse_announcement_dates("Válido al 31 de Julio 2026") == [date(2026, 7, 31)]


def test_date_context_uses_reference_day() -> None:
    ctx = _ctx_on(date(2026, 8, 5))
    assert ctx.reference_label == "5 de agosto de 2026"
    assert ctx.week_label == "3 al 9 de agosto de 2026"
    assert ctx.month_label == "agosto de 2026"


def test_detect_this_week_question() -> None:
    query = detect_announcement_timeframe("¿Hay algún evento esta semana?", _ctx_on(date(2026, 8, 5)))
    assert query.kind == "this_week"


def test_detect_specific_month_and_year() -> None:
    query = detect_announcement_timeframe("¿Qué eventos hay en septiembre de 2026?", _ctx_on(date(2026, 8, 5)))
    assert query.kind == "specific_month"
    assert query.target_month == 9
    assert query.target_year == 2026


def test_filter_events_this_week_with_match() -> None:
    result = filter_announcements_by_timeframe(
        EVENTS,
        "¿Hay algún evento esta semana?",
        today=date(2026, 8, 5),
    )
    assert result.scope == "matched"
    assert result.matched_total == 1
    assert result.items[0]["id"] == "aviso-6"
    assert "esta semana" in result.period_label


def test_filter_events_this_week_without_match_shows_upcoming() -> None:
    result = filter_announcements_by_timeframe(
        EVENTS,
        "¿Hay algún evento esta semana?",
        today=date(2026, 8, 17),
    )
    assert result.scope == "upcoming_fallback"
    assert result.matched_total == 0
    assert result.items[0]["id"] == "aviso-7"


def test_filter_events_this_month_august() -> None:
    result = filter_announcements_by_timeframe(
        EVENTS,
        "¿Qué actividades hay en el campus este mes?",
        today=date(2026, 8, 5),
    )
    assert result.scope == "matched"
    assert result.matched_total == 3
    assert result.period_label == "agosto de 2026"


def test_payload_builder_announcements_this_week(monkeypatch) -> None:
    monkeypatch.setattr(
        "app.agents.announcement_timeframe.reference_today",
        lambda: date(2026, 8, 5),
    )
    monkeypatch.setattr(
        "app.agents.announcement_timeframe.reference_now",
        lambda: datetime(2026, 8, 5, 10, 0, tzinfo=TZ),
    )
    raw = {"announcements": EVENTS, "total": len(EVENTS)}
    payload = _normalize_data("announcements", raw, "¿Hay algún evento esta semana?", False)
    assert payload is not None
    data = payload["data"]
    assert data["timeframe"] == "this_week"
    assert data["scope"] == "matched"
    assert data["reference_date"] == "5 de agosto de 2026"
    assert len(data["announcements"]) == 1


def test_intro_this_week_with_event() -> None:
    payload = {
        "type": "announcements",
        "data": {
            "announcements": [EVENTS[1]],
            "total": 1,
            "timeframe": "this_week",
            "scope": "matched",
            "matched_total": 1,
            "filter_type": "evento",
            "reference_date": "5 de agosto de 2026",
            "period_label": "esta semana (3 al 9 de agosto de 2026)",
        },
    }
    result = format_response_for_ui("", payload, user_message="¿Hay algún evento esta semana?")
    assert "Hoy es **5 de agosto de 2026**" in result
    assert "esta semana" in result
    assert "**1 evento**" in result


def test_intro_this_week_without_events_shows_upcoming() -> None:
    counts = compute_list_counts(2, 2)
    intro = build_announcements_intro(
        data={
            "timeframe": "this_week",
            "scope": "upcoming_fallback",
            "matched_total": 0,
            "filter_type": "evento",
            "reference_date": "17 de agosto de 2026",
            "period_label": "esta semana (11 al 17 de agosto de 2026)",
        },
        greeting="¡Hola, Carlos!",
        counts=counts,
        llm_text="",
        needs_template=True,
    )
    assert "Hoy es **17 de agosto de 2026**" in intro
    assert "No hay eventos programados" in intro
    assert "próximos eventos" in intro


def test_format_spanish_date() -> None:
    assert format_spanish_date(date(2026, 8, 8)) == "8 de agosto de 2026"

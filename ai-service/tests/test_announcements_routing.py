"""Tests de enrutamiento: preguntas sobre eventos/avisos del campus."""

import json
from pathlib import Path

from app.agents.conversation_intent import is_announcements_query
from app.agents.payload_builder import _payload_tool_priority, build_ui_payload
from app.agents.response_formatter import format_response_for_ui

DATA_PATH = Path(__file__).resolve().parents[2] / "mcp-server" / "data" / "announcements.json"


def _load_announcements() -> dict:
    with DATA_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)


def test_is_announcements_query_detects_actividades() -> None:
    assert is_announcements_query("¿Qué actividades hay en el campus este mes?")
    assert is_announcements_query("¿Hay algún evento esta semana?")
    assert not is_announcements_query("¿Cuántos cursos tengo?")


def test_priority_prefers_announcements_for_events_question() -> None:
    msg = "¿Qué actividades hay en el campus este mes?"
    assert _payload_tool_priority(msg)[0] == "get_announcements"


def test_build_ui_payload_announcements_this_month() -> None:
    raw = _load_announcements()
    msg = "¿Qué actividades hay en el campus este mes?"
    payload = build_ui_payload(
        ["get_announcements"],
        {"get_announcements": raw},
        user_message=msg,
    )
    assert payload is not None
    assert payload["type"] == "announcements"
    assert len(payload["data"]["announcements"]) >= 1
    assert payload["data"]["timeframe"] == "this_month"


def test_announcements_intro_with_cards() -> None:
    raw = _load_announcements()
    msg = "¿Qué actividades hay en el campus este mes?"
    payload = build_ui_payload(
        ["get_announcements"],
        {"get_announcements": raw},
        user_message=msg,
    )
    assert payload is not None
    result = format_response_for_ui("", payload, user_message=msg)
    assert "evento" in result.lower()
    assert "agosto" in result.lower()

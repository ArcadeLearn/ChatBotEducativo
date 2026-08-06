"""Tests de fallbacks: curso no inscrito, saludo con menú."""

from app.agents.conversation_intent import (
    build_main_menu_payload,
    is_greeting,
    should_show_main_menu,
)
from app.agents.course_query import extract_requested_course_title
from app.agents.payload_builder import build_ui_payload
from app.agents.response_formatter import format_response_for_ui

COURSES = [
    {"id": "curso-01", "title": "Programación de Células de Robótica Yaskawa", "progressPercentage": 65},
    {"id": "curso-02", "title": "Metrología 3D y Escaneo Láser FARO", "progressPercentage": 40},
    {"id": "curso-03", "title": "Inglés Técnico Industrial", "progressPercentage": 85},
    {"id": "curso-04", "title": "Prompt Engineering & Chatbots", "progressPercentage": 25},
]


def test_extract_lectura_redaccion_title() -> None:
    title = extract_requested_course_title(
        "Detalle de mi avance en Taller de Lectura y Redaccion"
    )
    assert title is not None
    assert "lectura" in title.lower() or "taller" in title.lower()


def test_course_not_enrolled_payload() -> None:
    msg = "Detalle de mi avance en Taller de Lectura y Redaccion"
    raw = {"courses": COURSES, "summary": {"total_courses": 4}}
    payload = build_ui_payload(
        ["get_enrolled_courses"],
        {"get_enrolled_courses": raw},
        user_message=msg,
    )
    assert payload is not None
    assert payload["type"] == "course_not_found"
    assert payload["data"]["total_enrolled"] == 4
    assert len(payload["data"]["courses"]) <= 8


def test_course_not_found_intro() -> None:
    payload = {
        "type": "course_not_found",
        "data": {
            "requested_title": "Taller de Lectura y Redacción",
            "total_enrolled": 4,
            "courses": COURSES,
        },
    }
    result = format_response_for_ui("", payload, user_message="Detalle avance lectura")
    assert "No tienes inscrito" in result
    assert "Taller" in result
    assert "4 cursos activos" in result


def test_greeting_shows_menu() -> None:
    assert is_greeting("hola")
    assert should_show_main_menu("hola", None)
    payload = build_main_menu_payload()
    assert payload["type"] == "main_menu"
    assert len(payload["data"]["options"]) >= 6


def test_greeting_menu_intro() -> None:
    payload = build_main_menu_payload()
    result = format_response_for_ui("", payload, user_message="hola")
    assert "asistente educativo" in result.lower()
    assert "menú" in result.lower() or "opción" in result.lower()

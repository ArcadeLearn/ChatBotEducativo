"""Tests de filtrado de curso por pregunta del alumno."""

from app.agents.course_query import is_specific_course_query, match_course_from_query
from app.agents.payload_builder import build_ui_payload


COURSES = [
    {"id": "curso-01", "title": "Programación de Células de Robótica Yaskawa", "progressPercentage": 65},
    {"id": "curso-02", "title": "Metrología 3D y Escaneo Láser FARO", "progressPercentage": 40},
]


def test_specific_course_query_yaskawa() -> None:
    msg = "¿Cuál es mi progreso en el curso de Yaskawa?"
    assert is_specific_course_query(msg)
    matched = match_course_from_query(COURSES, msg)
    assert matched is not None
    assert matched["id"] == "curso-01"


def test_payload_filters_to_single_course() -> None:
    msg = "¿Cuál es mi progreso en el curso de Yaskawa?"
    raw = {"courses": COURSES, "summary": {"total_courses": 2}}
    payload = build_ui_payload(
        ["get_enrolled_courses"],
        {"get_enrolled_courses": raw},
        user_message=msg,
    )
    assert payload is not None
    assert payload["type"] == "course_detail"
    assert payload["data"]["id"] == "curso-01"


def test_general_query_keeps_all_courses() -> None:
    msg = "¿Cuántos cursos tengo inscritos?"
    raw = {"courses": COURSES, "summary": {"total_courses": 2}}
    payload = build_ui_payload(
        ["get_enrolled_courses"],
        {"get_enrolled_courses": raw},
        user_message=msg,
    )
    assert payload is not None
    assert payload["type"] == "enrolled_courses"
    assert len(payload["data"]["courses"]) == 2

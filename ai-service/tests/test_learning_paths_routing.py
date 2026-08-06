"""Tests de enrutamiento: preguntas sobre rutas de aprendizaje vs perfil."""

from app.agents.conversation_intent import is_learning_paths_query
from app.agents.payload_builder import build_ui_payload, _payload_tool_priority
from app.agents.response_formatter import format_response_for_ui

SAMPLE_PATHS = {
    "paths": [
        {
            "id": "ruta-mecatronica-kuka",
            "title": "Especialista en Mecatrónica Industrial & Células Robóticas KUKA",
            "progressPercentage": 45,
            "isActive": True,
        },
        {
            "id": "ruta-plc-siemens",
            "title": "Automatización PLC Siemens S7",
            "progressPercentage": 12,
            "isActive": False,
        },
    ],
    "total": 2,
}

SAMPLE_PROFILE = {
    "name": "Carlos Eduardo Ramírez",
    "studentId": "IECA-2026-8842",
    "program": "Mecatrónica Industrial",
    "totalHours": 128,
}


def test_is_learning_paths_query_detects_ruta() -> None:
    assert is_learning_paths_query("¿En qué ruta debo continuar mis estudios?")
    assert is_learning_paths_query("Muéstrame mis rutas de aprendizaje")
    assert not is_learning_paths_query("¿Cuál es mi perfil?")


def test_priority_prefers_learning_paths_for_ruta_question() -> None:
    msg = "¿En qué ruta debo continuar mis estudios?"
    priority = _payload_tool_priority(msg)
    assert priority[0] == "get_learning_paths"


def test_build_ui_payload_learning_paths_over_profile() -> None:
    msg = "¿En qué ruta debo continuar mis estudios?"
    payload = build_ui_payload(
        ["get_student_profile", "get_learning_paths"],
        {
            "get_student_profile": SAMPLE_PROFILE,
            "get_learning_paths": SAMPLE_PATHS,
        },
        user_message=msg,
    )
    assert payload is not None
    assert payload["type"] == "learning_paths"
    assert payload["data"]["total"] == 2


def test_learning_paths_intro() -> None:
    payload = {
        "type": "learning_paths",
        "data": {"paths": SAMPLE_PATHS["paths"], "total": 2},
    }
    result = format_response_for_ui(
        "",
        payload,
        user_message="¿En qué ruta debo continuar mis estudios?",
    )
    assert "ruta" in result.lower()
    assert "2" in result

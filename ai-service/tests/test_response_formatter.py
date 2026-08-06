"""Tests del formateador de respuestas con UI rica."""

from app.agents.response_formatter import format_response_for_ui


def test_certificates_trims_numbered_list() -> None:
    raw = """¡Felicidades, Carlos! Tienes **25 certificados**.

Aquí tienes un resumen de tus **5 certificaciones más recientes**:

1. **Master en IA** (Diplomado)
   * **Fecha de acreditación:** 18 Enero, 2026
   * **Calificación:** 99/100

2. **Otro curso** (Curso)
   * **Calificación:** 96/100

---

Tus certificaciones abarcan robótica..."""

    payload = {
        "type": "certificates",
        "data": {"certificates": [{}] * 8, "total": 25},
    }
    result = format_response_for_ui(raw, payload)
    assert "Fecha de acreditación" not in result
    assert "Calificación:" not in result
    assert "1." not in result
    assert "25 certificados" in result
    assert "8 certificados más recientes" in result
    assert result.endswith(":")


def test_certificates_intro_when_all_fit() -> None:
    payload = {
        "type": "certificates",
        "data": {"certificates": [{}, {}], "total": 2},
    }
    result = format_response_for_ui("", payload)
    assert "2 certificados" in result
    assert "del más reciente al más antiguo" in result


def test_no_payload_keeps_full_text() -> None:
    text = "1. Item\n2. Item"
    assert format_response_for_ui(text, None) == text


def test_enrolled_courses_does_not_cut_mid_sentence() -> None:
    raw = (
        "¡Hola, Carlos Eduardo! Analizando tu perfil en Mecatrónica Industrial y tu excelente "
        "desempeño, actualmente tienes un gran avance en dos rutas de alta especialización "
        "tecnológica que se alinean perfectamente con las demandas de la industria automotriz y "
        "de automatización en el estado. Te recomiendo concentrar tus esfuerzos en completar "
        "los cursos con mayor progreso para obtener tu certificación pronto."
    )
    payload = {
        "type": "enrolled_courses",
        "data": {
            "courses": [{}, {}, {}, {}],
            "total": 4,
            "summary": {"total_courses": 4, "average_progress": 54},
        },
    }
    result = format_response_for_ui(raw, payload, user_message="¿En qué ruta debo continuar mis estudios?")
    assert "…" not in result
    assert "concentrar tus" not in result
    assert result.endswith(":")
    assert "4 cursos inscritos" in result
    assert "continuar" in result.lower()


def test_enrolled_courses_partial_large_list() -> None:
    payload = {
        "type": "enrolled_courses",
        "data": {
            "courses": [{}] * 8,
            "total": 100,
            "summary": {"total_courses": 100, "average_progress": 62},
        },
    }
    result = format_response_for_ui("", payload, user_message="¿Cuántos cursos tengo?")
    assert "100 cursos inscritos" in result
    assert "8" in result
    assert "100" in result

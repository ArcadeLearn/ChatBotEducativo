"""Tests de copy inteligente para listas parciales."""

from app.agents.partial_list_copy import (
    build_cta_line,
    build_list_intro,
    compute_list_counts,
    detect_question_focus,
)


def test_compute_list_counts_partial() -> None:
    counts = compute_list_counts(items_count=8, total=25)
    assert counts.total == 25
    assert counts.shown == 8
    assert counts.hidden == 17
    assert counts.is_partial is True


def test_detect_count_focus() -> None:
    assert detect_question_focus("¿Cuántos certificados he obtenido?", "certificates") == "count"


def test_detect_recent_focus() -> None:
    assert detect_question_focus("Lista de mis acreditaciones más recientes", "certificates") == "recent"


def test_certificates_cta_many_records() -> None:
    counts = compute_list_counts(8, 25)
    cta = build_cta_line("certificates", counts, "recent")
    assert "25" in cta
    assert "8" in cta
    assert "recientes" in cta


def test_enrolled_courses_cta_large_list() -> None:
    counts = compute_list_counts(8, 100)
    cta = build_cta_line("enrolled_courses", counts, "general")
    assert "100" in cta
    assert "8" in cta


def test_build_list_intro_certificates_count_question() -> None:
    counts = compute_list_counts(8, 25)
    intro = build_list_intro(
        kind="certificates",
        counts=counts,
        llm_text="",
        user_message="¿Cuántos certificados he obtenido?",
        greeting="¡Hola, Carlos!",
        needs_template=True,
    )
    assert "25 certificados" in intro
    assert "8" in intro
    assert intro.endswith(":")

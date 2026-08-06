"""Tests de construcción de payload UI."""

from app.agents.payload_builder import _normalize_data


def test_certificates_payload_limits_and_sorts_recent_first() -> None:
    raw = {
        "certificates": [
            {
                "certificate_id": "IECA-2024-OLD-1",
                "accreditation_date": "10 Enero, 2024",
                "course_title": "Antiguo",
            },
            {
                "certificate_id": "IECA-2026-NEW-1",
                "accreditation_date": "18 Enero, 2026",
                "course_title": "Reciente",
            },
        ],
        "total": 25,
    }

    payload = _normalize_data("certificates", raw, "", False)
    assert payload is not None
    data = payload["data"]
    assert data["total"] == 25
    assert len(data["certificates"]) == 2
    assert data["certificates"][0]["course_title"] == "Reciente"

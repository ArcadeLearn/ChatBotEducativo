"""Tests de filtro de planteles por especialidad/ciudad."""

import json
from pathlib import Path

from app.agents.payload_builder import _normalize_data
from app.agents.planteles_query import apply_planteles_query_filter
from app.agents.response_formatter import format_response_for_ui

PLANTELES = json.loads(
    Path(__file__).resolve().parents[2].joinpath("mcp-server/data/planteles.json").read_text(
        encoding="utf-8"
    )
)["planteles"]


def test_robotics_filter_returns_one_plantel() -> None:
    filtered, meta = apply_planteles_query_filter(
        PLANTELES,
        "Sedes con especialidad en robótica",
        catalog_total=len(PLANTELES),
    )
    assert len(filtered) == 1
    assert filtered[0]["id"] == "plan-03"
    assert meta["filtered"] is True
    assert meta["filter_label"] == "robótica"


def test_payload_builder_robotics_question() -> None:
    raw = {
        "planteles": PLANTELES,
        "total": len(PLANTELES),
        "catalog_total": len(PLANTELES),
    }
    payload = _normalize_data("planteles", raw, "Sedes con especialidad en robótica", False)
    assert payload is not None
    data = payload["data"]
    assert data["total"] == 1
    assert len(data["map_planteles"]) == 1
    assert data["filtered"] is True


def test_intro_robotics_one_result() -> None:
    payload = {
        "type": "planteles",
        "data": {
            "planteles": [PLANTELES[2]],
            "total": 1,
            "catalog_total": 18,
            "filtered": True,
            "filter_label": "robótica",
        },
    }
    result = format_response_for_ui("", payload, user_message="Sedes con especialidad en robótica")
    assert "1 plantel" in result
    assert "robótica" in result
    assert "18" in result
    assert "18 sedes" not in result.lower() or "de **18**" in result

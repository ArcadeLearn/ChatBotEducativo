"""Tests de filtro e intro de facturas."""

import json
from pathlib import Path

from app.agents.payload_builder import _normalize_data
from app.agents.invoices_query import detect_invoice_focus
from app.agents.response_formatter import format_response_for_ui

INVOICES = json.loads(
    Path(__file__).resolve().parents[2].joinpath("mcp-server/data/invoices.json").read_text(
        encoding="utf-8"
    )
)["invoices"]


def test_detect_pending_focus() -> None:
    assert detect_invoice_focus("Tengo facturas pendientes") == "pending"


def test_detect_payment_history_focus() -> None:
    assert detect_invoice_focus("Historial de pagos") == "payment_history"


def test_detect_invoices_list_focus() -> None:
    assert detect_invoice_focus("Cuales son mis facturas") == "invoices_list"


def test_payload_payment_history_filters_paid() -> None:
    raw = {"invoices": INVOICES, "total": len(INVOICES)}
    payload = _normalize_data("invoices", raw, "Historial de pagos", False)
    assert payload is not None
    data = payload["data"]
    assert data["focus"] == "payment_history"
    assert data["view_mode"] == "payments"
    assert data["total"] == 2
    assert data["paid_total"] == 5300


def test_payload_invoices_list() -> None:
    raw = {"invoices": INVOICES, "total": len(INVOICES)}
    payload = _normalize_data("invoices", raw, "Cuales son mis facturas", False)
    assert payload is not None
    assert payload["data"]["view_mode"] == "invoices"
    assert payload["data"]["focus"] == "invoices_list"


def test_detect_total_paid_focus() -> None:
    assert detect_invoice_focus("¿Cuánto he pagado en total?") == "total_paid"


def test_payload_builder_invoices() -> None:
    raw = {"invoices": INVOICES, "total": len(INVOICES), "paid_total": 5300}
    payload = _normalize_data("invoices", raw, "¿Cuáles son mis facturas?", False)
    assert payload is not None
    data = payload["data"]
    assert data["total"] == 2
    assert len(data["invoices"]) == 2
    assert data["paid_total"] == 5300


def test_payload_pending_empty_for_carlos() -> None:
    raw = {"invoices": INVOICES, "total": len(INVOICES)}
    payload = _normalize_data("invoices", raw, "Tengo facturas pendientes", False)
    assert payload is not None
    assert payload["data"]["empty"] is True
    assert payload["data"]["focus"] == "pending"


def test_intro_no_pending() -> None:
    payload = {
        "type": "invoices",
        "data": {
            "invoices": [],
            "total": 0,
            "catalog_total": 2,
            "paid_total": 5300,
            "pending_count": 0,
            "focus": "pending",
            "empty": True,
        },
    }
    result = format_response_for_ui("", payload, user_message="¿Tengo facturas pendientes?")
    assert "No tienes facturas pendientes" in result
    assert "2" in result

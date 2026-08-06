"""
Filtro e intención de preguntas sobre facturas y pagos del alumno.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Any, Literal

InvoiceFocus = Literal[
    "all",
    "pending",
    "paid",
    "total_paid",
    "payment_history",
    "invoices_list",
]


def normalize_text(text: str) -> str:
    """Normaliza texto para comparación (sin acentos, minúsculas)."""
    normalized = unicodedata.normalize("NFD", text or "")
    stripped = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    return stripped.lower().strip()


def detect_invoice_focus(user_message: str) -> InvoiceFocus:
    """
    Detecta si la pregunta pide pendientes, total pagado o historial general.

    Args:
        user_message: Pregunta del alumno.

    Returns:
        Enfoque: payment_history, invoices_list, pending, total_paid, paid o all.
    """
    query = normalize_text(user_message)

    if re.search(
        r"\b(cuanto|cuanta|total|suma|monto)\b.*\b(pagad|pague|pagado|pagos)\b"
        r"|\b(pagad|pague)\b.*\b(total|en total)\b",
        query,
    ):
        return "total_paid"

    if re.search(
        r"\b(pendientes?|por pagar|adeudo|debo|vencid|sin pagar|por cobrar)\b",
        query,
    ):
        return "pending"

    if re.search(
        r"\b(historial de pagos?|historial de pago|mis pagos|pagos realizados|"
        r"recibos|movimientos de pago|que he pagado)\b",
        query,
    ):
        return "payment_history"

    if re.search(
        r"\b(facturas?|cfdi|comprobantes? fiscales?|folio fiscal)\b",
        query,
    ):
        return "invoices_list"

    if re.search(r"\b(pagad|liquidad|completad)\b", query) and "factura" in query:
        return "paid"

    return "all"


def invoice_view_mode(focus: InvoiceFocus) -> str:
    """Modo visual del frontend: pagos vs. facturas CFDI."""
    if focus in ("payment_history", "total_paid", "paid"):
        return "payments"
    if focus in ("invoices_list", "pending"):
        return "invoices"
    return "invoices"


def filter_invoices_by_focus(
    items: list[dict[str, Any]],
    focus: InvoiceFocus,
) -> list[dict[str, Any]]:
    """Filtra facturas según el enfoque detectado."""
    if focus == "pending":
        return [item for item in items if normalize_text(str(item.get("status", ""))) != "pagado"]
    if focus in ("paid", "payment_history", "total_paid"):
        return [item for item in items if normalize_text(str(item.get("status", ""))) == "pagado"]
    return list(items)


def compute_invoice_summary(items: list[dict[str, Any]]) -> dict[str, Any]:
    """Calcula totales pagados y pendientes para tarjetas UI."""
    paid_items = [
        item for item in items if normalize_text(str(item.get("status", ""))) == "pagado"
    ]
    pending_items = [
        item for item in items if normalize_text(str(item.get("status", ""))) != "pagado"
    ]
    paid_total = sum(float(item.get("amount") or 0) for item in paid_items)
    pending_total = sum(float(item.get("amount") or 0) for item in pending_items)
    return {
        "paid_total": paid_total,
        "pending_total": pending_total,
        "paid_count": len(paid_items),
        "pending_count": len(pending_items),
    }

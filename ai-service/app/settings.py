"""Configuración del AI Service educativo."""

import os
from functools import lru_cache


@lru_cache
def get_settings() -> dict[str, str | int]:
    """
    Lee variables de entorno del AI Service.

    Returns:
        Dict con puerto, URLs y modelo LLM.
    """
    return {
        "port": int(os.getenv("PORT", "8001")),
        "mcp_server_url": os.getenv("MCP_SERVER_URL", "http://127.0.0.1:8002"),
        "llm_provider": os.getenv("LLM_PROVIDER", "gemini"),
        "llm_model": os.getenv("LLM_MODEL", "gemini-3.7-flash"),
        "llm_fallback_model": os.getenv("LLM_FALLBACK_MODEL", "gemini-3.5-flash-lite"),
        "google_api_key": (
            os.getenv("GOOGLE_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY") or ""
        ).strip(),
        "max_ui_cards": _parse_max_ui_cards(),
    }


def _parse_max_ui_cards() -> int:
    """Tarjetas máximo en payloads Rich UI (default 8, rango 1–24)."""
    raw = os.getenv("MAX_UI_CARDS", "8")
    try:
        value = int(raw)
    except ValueError:
        return 8
    return max(1, min(24, value))


def get_max_ui_cards() -> int:
    """Atajo para el límite de tarjetas en payload_builder y response_formatter."""
    return int(get_settings()["max_ui_cards"])

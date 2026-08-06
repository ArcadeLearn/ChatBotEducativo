"""Configuración del MCP Server educativo."""

import os
from pathlib import Path


def get_data_dir() -> Path:
    """Resuelve la ruta al directorio de JSONs educativos."""
    base = Path(__file__).resolve().parent.parent
    configured = os.getenv("DATA_DIR", "./data")
    path = Path(configured)
    if path.is_absolute():
        return path
    return (base / path).resolve()


def get_port() -> int:
    """Puerto HTTP del servicio."""
    return int(os.getenv("PORT", "8002"))

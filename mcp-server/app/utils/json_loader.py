"""
Utilidades para cargar archivos JSON de datos educativos.
Cache en memoria para evitar lecturas repetidas en cada invocación de tool.
"""

from functools import lru_cache
from pathlib import Path
from typing import Any

from app.settings import get_data_dir


@lru_cache(maxsize=32)
def load_json_file(filename: str) -> dict[str, Any]:
    """
    Carga un archivo JSON del directorio de datos.

    Args:
        filename: Nombre del archivo (ej. students.json).

    Returns:
        Contenido parseado como dict.

    Raises:
        FileNotFoundError: Si el archivo no existe.
    """
    path = get_data_dir() / filename
    if not path.exists():
        raise FileNotFoundError(f"Archivo de datos no encontrado: {path}")
    import json

    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def normalize_text(value: str) -> str:
    """Normaliza texto para búsquedas case-insensitive sin acentos básicos."""
    replacements = {"á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u", "ñ": "n"}
    lowered = value.lower().strip()
    for src, dst in replacements.items():
        lowered = lowered.replace(src, dst)
    return lowered

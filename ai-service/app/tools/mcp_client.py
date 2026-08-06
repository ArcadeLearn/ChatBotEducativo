"""Cliente HTTP hacia el MCP Server educativo."""

from typing import Any

import httpx

from app.settings import get_settings


async def invoke_mcp_tool(tool_name: str, payload: dict[str, Any]) -> dict[str, Any]:
    """
    Invoca una tool del MCP Server.

    Args:
        tool_name: Nombre registrado en el MCP.
        payload: Parámetros JSON de la tool.

    Returns:
        Respuesta parseada del MCP (dict con success, data, error).

    Raises:
        httpx.HTTPError: Si el MCP no responde o retorna error HTTP.
    """
    settings = get_settings()
    url = f"{settings['mcp_server_url']}/api/tools/{tool_name}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        return response.json()


async def mcp_health_ok() -> bool:
    """Verifica si el MCP Server responde en /health."""
    settings = get_settings()
    url = f"{settings['mcp_server_url']}/health"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            return response.status_code == 200
    except httpx.HTTPError:
        return False

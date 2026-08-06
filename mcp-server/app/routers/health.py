"""Router de health check del MCP Server educativo."""

from fastapi import APIRouter

router = APIRouter(tags=["Servicio"])


@router.get("/health")
async def health() -> dict[str, str]:
    """
    Verifica que el MCP Server está operativo.

    Returns:
        Estado del servicio y nombre identificador.
    """
    return {"status": "ok", "service": "mcp-server-educativo"}

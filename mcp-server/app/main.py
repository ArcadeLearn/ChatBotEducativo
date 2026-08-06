"""
Aplicación FastAPI del MCP Server educativo.
Expone health check y POST /api/tools/{tool_name}.
"""

from fastapi import FastAPI

from app.routers import health, tools

app = FastAPI(
    title="MCP Server Educativo — Campus IECA",
    description="Tools educativas que consultan datos JSON simulados de campusdemo.",
    version="1.0.0",
)

app.include_router(health.router)
app.include_router(tools.router)

"""Schemas de request/response para el chat educativo."""

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Mensaje del historial conversacional."""

    role: str = Field(..., description="user o assistant")
    content: str


class ChatRequest(BaseModel):
    """Body de POST /chat."""

    message: str = Field(..., min_length=1, description="Pregunta del alumno")
    student_id: str = Field(default="user-01", description="ID del alumno en contexto")
    history: list[ChatMessage] = Field(default_factory=list, description="Historial previo")
    stream: bool = Field(default=False, description="Si true, usar endpoint /chat/stream")


class ChatResponse(BaseModel):
    """Respuesta síncrona del agente educativo."""

    response: str
    model: str
    student_id: str
    tools_used: list[str] = Field(default_factory=list)
    payload: dict | None = Field(
        default=None,
        description="Datos estructurados para UI rica (tarjetas, gráficos)",
    )

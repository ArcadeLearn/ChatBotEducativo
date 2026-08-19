"""
Factory del LLM Gemini para el agente educativo.
Default: gemini-3.7-flash (con fallback configurado en 3.5-flash-lite).
"""

from langchain_google_genai import ChatGoogleGenerativeAI

from app.settings import get_settings


def create_llm() -> ChatGoogleGenerativeAI:
    """
    Crea instancia de ChatGoogleGenerativeAI con modelo configurado.

    Returns:
        LLM listo para bind_tools / LangGraph.

    Raises:
        ValueError: Si no hay GOOGLE_GEMINI_API_KEY configurada.
    """
    settings = get_settings()
    api_key = str(settings["google_api_key"])
    if not api_key:
        raise ValueError(
            "GOOGLE_GEMINI_API_KEY no configurada. Copia ai-service/.env.example a .env"
        )
    return ChatGoogleGenerativeAI(
        model=str(settings["llm_model"]),
        google_api_key=api_key,
        temperature=0.2,
        max_output_tokens=4096,
    )


def get_model_name() -> str:
    """Nombre del modelo activo (para metadata de respuesta)."""
    return str(get_settings()["llm_model"])

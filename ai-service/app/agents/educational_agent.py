"""
Agente LangGraph educativo (ReAct) con tools del MCP Server.
Grafo: agent -> tools -> agent hasta respuesta final.
Expone texto limpio + payload UI rico con datos de tools.
"""

import json
from typing import Annotated, Any, Literal

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict

from app.agents.conversation_intent import (
    build_main_menu_payload,
    is_announcements_query,
    is_learning_paths_query,
    should_show_main_menu,
)
from app.agents.announcement_timeframe import is_event_question
from app.agents.payload_builder import build_ui_payload
from app.agents.response_formatter import format_response_for_ui
from app.prompts.system_prompt import build_system_prompt
from app.services.llm_factory import create_llm, get_model_name
from app.tools.edu_tools import build_edu_tools
from app.tools.mcp_client import invoke_mcp_tool


class AgentState(TypedDict):
    """Estado del grafo LangGraph."""

    messages: Annotated[list[Any], add_messages]
    tool_outputs: dict[str, Any]


def _extract_text(content: Any) -> str:
    """
    Extrae texto limpio del content de AIMessage.
    Gemini puede devolver str o lista de bloques [{type, text, extras}].
    """
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        parts: list[str] = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                text = block.get("text", "")
                if isinstance(text, str) and text.strip():
                    parts.append(text.strip())
            elif isinstance(block, str) and block.strip():
                parts.append(block.strip())
        return " ".join(parts).strip()
    if content is None:
        return ""
    return str(content).strip()


def _parse_tool_result(raw: str) -> Any | None:
    """Parsea JSON retornado por una tool LangChain."""
    try:
        parsed = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return None
    if isinstance(parsed, dict) and parsed.get("error"):
        return None
    return parsed


async def _ensure_learning_paths_data(
    student_id: str,
    tool_outputs: dict[str, Any],
    tools_used: list[str],
) -> None:
    """
    Garantiza datos de rutas cuando la pregunta es sobre trayectorias.

    El LLM a veces invoca get_student_profile en lugar de get_learning_paths;
    aquí se corrige antes de construir el payload UI.
    """
    existing = tool_outputs.get("get_learning_paths")
    if isinstance(existing, dict) and existing.get("paths"):
        return

    try:
        result = await invoke_mcp_tool("get_learning_paths", {"student_id": student_id})
    except Exception:  # noqa: BLE001
        return

    if not result.get("success"):
        return

    data = result.get("data")
    if not isinstance(data, dict) or not data.get("paths"):
        return

    tool_outputs["get_learning_paths"] = data
    if "get_learning_paths" not in tools_used:
        tools_used.append("get_learning_paths")


async def _ensure_announcements_data(
    user_message: str,
    tool_outputs: dict[str, Any],
    tools_used: list[str],
) -> None:
    """
    Garantiza datos de avisos/eventos cuando la pregunta es sobre el calendario del campus.

    El LLM a veces responde en texto sin invocar get_announcements; aquí se corrige
    antes de construir el payload UI.
    """
    existing = tool_outputs.get("get_announcements")
    if isinstance(existing, dict) and existing.get("announcements"):
        return

    payload: dict[str, Any] = {}
    if is_event_question(user_message):
        payload["type"] = "evento"

    try:
        result = await invoke_mcp_tool("get_announcements", payload)
    except Exception:  # noqa: BLE001
        return

    if not result.get("success"):
        return

    data = result.get("data")
    if not isinstance(data, dict) or not data.get("announcements"):
        return

    tool_outputs["get_announcements"] = data
    if "get_announcements" not in tools_used:
        tools_used.append("get_announcements")


async def _resolve_student_name(student_id: str) -> str | None:
    """Obtiene nombre del alumno para personalizar el system prompt."""
    try:
        result = await invoke_mcp_tool("get_student_profile", {"student_id": student_id})
        if result.get("success") and isinstance(result.get("data"), dict):
            return result["data"].get("name")
    except Exception:  # noqa: BLE001
        return None
    return None


def _extract_tools_used(messages: list[Any]) -> list[str]:
    """Recopila nombres de tools invocadas en el turno."""
    used: list[str] = []
    for msg in messages:
        if isinstance(msg, AIMessage) and getattr(msg, "tool_calls", None):
            for call in msg.tool_calls:
                name = call.get("name") if isinstance(call, dict) else getattr(call, "name", None)
                if name and name not in used:
                    used.append(name)
    return used


def _history_to_messages(history: list[dict[str, str]]) -> list[Any]:
    """Convierte historial del request a mensajes LangChain."""
    messages: list[Any] = []
    for item in history:
        role = item.get("role", "")
        content = item.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))
    return messages


def _build_agent_graph(student_id: str):
    """
    Construye grafo LangGraph con nodo agente y nodo tools.

    Args:
        student_id: Alumno activo para inyectar en tools.

    Returns:
        Grafo compilado listo para ainvoke.
    """
    tools = build_edu_tools(student_id)
    tools_by_name = {tool.name: tool for tool in tools}
    llm = create_llm().bind_tools(tools)

    async def agent_node(state: AgentState) -> dict[str, list[Any]]:
        response = await llm.ainvoke(state["messages"])
        return {"messages": [response]}

    async def tools_node(state: AgentState) -> dict[str, Any]:
        last = state["messages"][-1]
        outputs: list[ToolMessage] = []
        tool_outputs = dict(state.get("tool_outputs") or {})

        if not isinstance(last, AIMessage) or not last.tool_calls:
            return {"messages": outputs, "tool_outputs": tool_outputs}

        for call in last.tool_calls:
            name = call["name"]
            args = call.get("args", {})
            tool = tools_by_name.get(name)
            if not tool:
                outputs.append(
                    ToolMessage(content=f"Tool desconocida: {name}", tool_call_id=call["id"])
                )
                continue
            result = await tool.ainvoke(args)
            parsed = _parse_tool_result(str(result))
            if parsed is not None:
                tool_outputs[name] = parsed
            outputs.append(ToolMessage(content=str(result), tool_call_id=call["id"]))

        return {"messages": outputs, "tool_outputs": tool_outputs}

    def route_after_agent(state: AgentState) -> Literal["tools", "end"]:
        last = state["messages"][-1]
        if isinstance(last, AIMessage) and last.tool_calls:
            return "tools"
        return "end"

    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tools_node)
    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", route_after_agent, {"tools": "tools", "end": END})
    graph.add_edge("tools", "agent")
    return graph.compile()


async def run_educational_agent(
    message: str,
    student_id: str,
    history: list[dict[str, str]] | None = None,
) -> tuple[str, list[str], dict[str, Any] | None]:
    """
    Ejecuta el agente LangGraph y retorna respuesta, tools y payload UI.

    Args:
        message: Pregunta del alumno.
        student_id: ID del alumno en contexto.
        history: Historial previo [{role, content}].

    Returns:
        Tupla (respuesta_texto, lista_tools_usadas, payload_ui).
    """
    student_name = await _resolve_student_name(student_id)
    agent = _build_agent_graph(student_id)

    messages: list[Any] = [
        SystemMessage(content=build_system_prompt(student_id, student_name)),
        *_history_to_messages(history or []),
        HumanMessage(content=message),
    ]

    result = await agent.ainvoke({"messages": messages, "tool_outputs": {}})
    result_messages = result.get("messages", [])
    tool_outputs: dict[str, Any] = result.get("tool_outputs") or {}
    tools_used = _extract_tools_used(result_messages)

    if is_learning_paths_query(message):
        await _ensure_learning_paths_data(student_id, tool_outputs, tools_used)

    if is_announcements_query(message):
        await _ensure_announcements_data(message, tool_outputs, tools_used)

    last_content = ""
    for msg in reversed(result_messages):
        if isinstance(msg, AIMessage) and msg.content:
            if getattr(msg, "tool_calls", None):
                continue
            last_content = _extract_text(msg.content)
            if last_content:
                break

    payload = build_ui_payload(tools_used, tool_outputs, user_message=message)
    if should_show_main_menu(message, payload):
        payload = build_main_menu_payload()
    fallback = "No pude generar una respuesta. Intenta reformular tu pregunta."
    final_text = format_response_for_ui(last_content or fallback, payload, user_message=message)
    return final_text, tools_used, payload


def get_active_model_name() -> str:
    """Expone el modelo configurado para metadata HTTP."""
    return get_model_name()

"""Evaluacion rapida de 20 prompts para ChatBotEducativo."""

from __future__ import annotations

import json
import statistics
import time
from dataclasses import dataclass

import requests


CHAT_URL = "http://127.0.0.1:8001/chat"
TIMEOUT_SECONDS = 120
STUDENT_ID = "user-01"


@dataclass(frozen=True)
class PromptCase:
    prompt: str
    expected_tools: tuple[str, ...]


CASES: list[PromptCase] = [
    PromptCase("Hola", tuple()),
    PromptCase("Que puedes hacer?", tuple()),
    PromptCase("Cual es mi perfil?", ("get_student_profile",)),
    PromptCase("Cuantos cursos tengo inscritos?", ("get_enrolled_courses",)),
    PromptCase(
        "Cual es mi progreso en el curso de Yaskawa?",
        ("get_enrolled_courses", "get_course_detail"),
    ),
    PromptCase("Dame detalle del curso de Metrologia 3D", ("get_enrolled_courses", "get_course_detail")),
    PromptCase("Cuales son mis certificados?", ("get_certificates",)),
    PromptCase("Hay algun evento esta semana?", ("get_announcements",)),
    PromptCase("Que actividades hay este mes?", ("get_announcements",)),
    PromptCase("Cual es el proximo evento?", ("get_announcements",)),
    PromptCase("Donde estan las sedes del campus?", ("get_planteles",)),
    PromptCase("Hay sedes con robotica en Leon?", ("get_planteles",)),
    PromptCase("Muestrame mis facturas", ("get_invoices",)),
    PromptCase("Historial de pagos", ("get_invoices",)),
    PromptCase("Tengo facturas pendientes?", ("get_invoices",)),
    PromptCase("Que cursos de automatizacion hay disponibles?", ("search_course_catalog",)),
    PromptCase("Que cursos nivel intermedio hay?", ("search_course_catalog",)),
    PromptCase("En que ruta debo continuar mis estudios?", ("get_learning_paths",)),
    PromptCase("Muestrame mis rutas de aprendizaje", ("get_learning_paths",)),
    PromptCase("Como va mi avance general del alumno?", ("get_student_stats",)),
]


def run_case(case: PromptCase) -> dict:
    started = time.perf_counter()
    response = requests.post(
        CHAT_URL,
        json={"message": case.prompt, "student_id": STUDENT_ID},
        timeout=TIMEOUT_SECONDS,
    )
    elapsed_ms = (time.perf_counter() - started) * 1000

    row: dict = {
        "prompt": case.prompt,
        "status": response.status_code,
        "latency_ms": round(elapsed_ms, 1),
        "expected_tools": list(case.expected_tools),
    }
    if not response.ok:
        row["ok"] = False
        row["error"] = response.text[:400]
        return row

    payload = response.json()
    tools_used = payload.get("tools_used", [])
    row["ok"] = True
    row["model"] = payload.get("model")
    row["tools_used"] = tools_used
    row["payload_type"] = (payload.get("payload") or {}).get("type")
    row["expected_match"] = all(tool in tools_used for tool in case.expected_tools)
    row["response_preview"] = str(payload.get("response", ""))[:140]
    return row


def summarize(rows: list[dict]) -> dict:
    ok_rows = [r for r in rows if r.get("ok")]
    latencies = [r["latency_ms"] for r in ok_rows]
    matches = [r for r in ok_rows if r.get("expected_match")]
    failures = [r for r in rows if not r.get("ok")]

    tool_counter: dict[str, int] = {}
    for row in ok_rows:
        for tool in row.get("tools_used", []):
            tool_counter[tool] = tool_counter.get(tool, 0) + 1

    result = {
        "total_cases": len(rows),
        "ok_cases": len(ok_rows),
        "failed_cases": len(failures),
        "expected_tool_match_cases": len(matches),
        "expected_tool_match_rate": round((len(matches) / len(ok_rows) * 100), 1) if ok_rows else 0.0,
        "latency_avg_ms": round(statistics.mean(latencies), 1) if latencies else None,
        "latency_median_ms": round(statistics.median(latencies), 1) if latencies else None,
        "latency_p95_ms": round(sorted(latencies)[max(0, int(len(latencies) * 0.95) - 1)], 1) if latencies else None,
        "tool_usage_count": dict(sorted(tool_counter.items(), key=lambda kv: (-kv[1], kv[0]))),
    }
    return result


def main() -> None:
    rows = [run_case(case) for case in CASES]
    report = {
        "summary": summarize(rows),
        "results": rows,
    }
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()

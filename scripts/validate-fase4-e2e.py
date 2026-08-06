#!/usr/bin/env python3
"""Validación E2E Fase 4: login + sesiones + POST /chat."""
from __future__ import annotations

import json
import sys

import httpx

BASE = "http://127.0.0.1:4001"
EMAIL = "carlos.ramirez@ieca.edu.mx"
PASSWORD = "1234"
CHAT_MESSAGE = "Cuantos cursos tengo inscritos?"


def main() -> int:
    results: list[tuple[str, bool, str]] = []

    with httpx.Client(timeout=180.0) as client:
        # 1. Health
        try:
            r = client.get(f"{BASE}/health")
            ok = r.status_code == 200
            results.append(("GET /health", ok, f"{r.status_code} {r.text[:120]}"))
        except Exception as exc:
            results.append(("GET /health", False, str(exc)))
            print_report(results)
            return 1

        # 2. Login
        try:
            r = client.post(
                f"{BASE}/auth/login",
                json={"email": EMAIL, "password": PASSWORD},
            )
            body = r.json()
            ok = r.status_code == 200 and "token" in body
            token = body.get("token", "") if ok else ""
            results.append(
                (
                    "POST /auth/login",
                    ok,
                    f"{r.status_code} email={body.get('email')} externalId={body.get('externalId')}",
                )
            )
        except Exception as exc:
            results.append(("POST /auth/login", False, str(exc)))
            print_report(results)
            return 1

        if not ok:
            print_report(results)
            return 1

        headers = {"Authorization": f"Bearer {token}"}

        # 3. Crear sesión
        try:
            r = client.post(f"{BASE}/sessions", headers=headers, json={"title": "Prueba E2E"})
            ok = r.status_code in (200, 201) and "id" in r.json()
            session_id = r.json().get("id", "") if ok else ""
            results.append(("POST /sessions", ok, f"{r.status_code} sessionId={session_id}"))
        except Exception as exc:
            results.append(("POST /sessions", False, str(exc)))
            print_report(results)
            return 1

        # 4. Listar sesiones
        try:
            r = client.get(f"{BASE}/sessions", headers=headers)
            ok = r.status_code == 200 and isinstance(r.json(), list)
            results.append(("GET /sessions", ok, f"{r.status_code} count={len(r.json()) if ok else 0}"))
        except Exception as exc:
            results.append(("GET /sessions", False, str(exc)))

        # 5. Chat
        try:
            payload = {"message": CHAT_MESSAGE}
            if session_id:
                payload["sessionId"] = session_id
            r = client.post(f"{BASE}/chat", headers=headers, json=payload)
            body = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
            ok = r.status_code in (200, 201) and bool(body.get("response"))
            reply_raw = body.get("response") or ""
            if isinstance(reply_raw, list):
                reply = str(reply_raw)[:200]
            else:
                reply = str(reply_raw)[:200]
            tools = body.get("toolsUsed") or body.get("tools_used") or []
            model = body.get("model", "")
            results.append(
                (
                    "POST /chat",
                    ok,
                    f"{r.status_code} model={model} tools={tools} len={len(str(reply_raw))}",
                )
            )
            if ok and session_id:
                r2 = client.get(f"{BASE}/sessions/{session_id}/messages", headers=headers)
                msg_ok = r2.status_code == 200 and len(r2.json()) >= 2
                results.append(
                    (
                        "GET /sessions/:id/messages",
                        msg_ok,
                        f"{r2.status_code} messages={len(r2.json()) if r2.status_code == 200 else 0}",
                    )
                )
        except Exception as exc:
            results.append(("POST /chat", False, str(exc)))

    print_report(results)
    return 0 if all(r[1] for r in results) else 1


def print_report(results: list[tuple[str, bool, str]]) -> None:
    print("\n=== Validación E2E Fase 4 ===")
    for name, ok, detail in results:
        mark = "OK" if ok else "FAIL"
        print(f"[{mark}] {name}: {detail}")
    passed = sum(1 for _, ok, _ in results if ok)
    print(f"\nResultado: {passed}/{len(results)} pruebas OK")


if __name__ == "__main__":
    sys.exit(main())

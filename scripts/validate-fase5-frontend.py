#!/usr/bin/env python3
"""Validación Fase 5 — frontend :3001 + API route + backend."""
from __future__ import annotations

import json
import sys

import httpx

FRONTEND = "http://127.0.0.1:3001"
BACKEND = "http://127.0.0.1:4001"


def main() -> int:
    results: list[tuple[str, bool, str]] = []

    with httpx.Client(timeout=180.0, follow_redirects=True) as client:
        for path in ["/login", "/chat", "/widget"]:
            try:
                r = client.get(f"{FRONTEND}{path}")
                ok = r.status_code == 200
                results.append((f"GET {path}", ok, f"{r.status_code} len={len(r.text)}"))
            except Exception as exc:
                results.append((f"GET {path}", False, str(exc)))

        try:
            login = client.post(
                f"{BACKEND}/auth/login",
                json={"email": "carlos.ramirez@ieca.edu.mx", "password": "1234"},
            )
            token = login.json()["token"]
            results.append(("POST backend /auth/login", login.status_code == 200, f"{login.status_code}"))

            stream = client.post(
                f"{FRONTEND}/api/chat",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "messages": [{"role": "user", "content": "Cuantos cursos tengo inscritos?"}],
                    "sessionId": None,
                },
            )
            session_id = stream.headers.get("x-session-id", "")
            body = stream.text
            ok = stream.status_code == 200 and len(body) > 50
            results.append(
                (
                    "POST /api/chat (stream)",
                    ok,
                    f"{stream.status_code} session={session_id[:8]}... chars={len(body)}",
                )
            )
        except Exception as exc:
            results.append(("POST /api/chat (stream)", False, str(exc)))

    print("\n=== Validación Fase 5 Frontend ===")
    for name, ok, detail in results:
        print(f"[{'OK' if ok else 'FAIL'}] {name}: {detail}")
    passed = sum(1 for _, ok, _ in results if ok)
    print(f"\nResultado: {passed}/{len(results)} pruebas OK")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Validación Rich UI — texto limpio + payload en cadena completa."""
from __future__ import annotations

import base64
import json
import sys

import httpx

BACKEND = "http://127.0.0.1:4001"
FRONTEND = "http://127.0.0.1:3001"
QUESTION = "Cual es mi progreso en el curso de Yaskawa?"


def decode_payload(header: str) -> dict | None:
    try:
        raw = base64.b64decode(header)
        return json.loads(raw.decode("utf-8"))
    except Exception:
        return None


def main() -> int:
    results: list[tuple[str, bool, str]] = []

    with httpx.Client(timeout=180.0) as client:
        login = client.post(
            f"{BACKEND}/auth/login",
            json={"email": "carlos.ramirez@ieca.edu.mx", "password": "1234"},
        )
        token = login.json()["token"]
        results.append(("login", login.status_code == 200, str(login.status_code)))

        chat = client.post(
            f"{BACKEND}/chat",
            headers={"Authorization": f"Bearer {token}"},
            json={"message": QUESTION},
        )
        body = chat.json()
        response = body.get("response", "")
        payload = body.get("payload")
        has_payload = isinstance(payload, dict) and bool(payload.get("type"))
        no_raw_json = "[{'type'" not in str(response) and "signature" not in str(response)
        results.append(
            (
                "POST /chat texto limpio",
                chat.status_code in (200, 201) and no_raw_json and len(str(response)) > 20,
                f"status={chat.status_code} len={len(str(response))} raw_json={not no_raw_json}",
            )
        )
        results.append(
            (
                "POST /chat payload",
                has_payload,
                f"type={payload.get('type') if payload else None}",
            )
        )

        stream = client.post(
            f"{FRONTEND}/api/chat",
            headers={"Authorization": f"Bearer {token}"},
            json={"messages": [{"role": "user", "content": QUESTION}]},
        )
        header_payload = stream.headers.get("x-chat-payload")
        decoded = decode_payload(header_payload) if header_payload else None
        results.append(
            (
                "POST /api/chat X-Chat-Payload",
                stream.status_code == 200 and decoded is not None,
                f"type={decoded.get('type') if decoded else None}",
            )
        )

    print("\n=== Validación Rich UI ===")
    for name, ok, detail in results:
        print(f"[{'OK' if ok else 'FAIL'}] {name}: {detail}")
    passed = sum(1 for _, ok, _ in results if ok)
    print(f"\nResultado: {passed}/{len(results)}")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())

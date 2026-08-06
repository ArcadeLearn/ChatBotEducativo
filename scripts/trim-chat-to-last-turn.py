#!/usr/bin/env python3
"""Deja solo el último turno (user + assistant) en la sesión más reciente."""
from __future__ import annotations

import subprocess
import sys

CONTAINER = "chatbot-educativo-postgres-1"
DB = "edu_chatbot_db"


def psql(sql: str) -> str:
    result = subprocess.run(
        ["docker", "exec", CONTAINER, "psql", "-U", "postgres", "-d", DB, "-t", "-A", "-c", sql],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr or result.stdout)
    return result.stdout.strip()


def main() -> int:
    total_before = psql("SELECT COUNT(*) FROM messages;")
    print(f"Mensajes antes: {total_before}")

    # Sesión más reciente por updatedAt
    session_id = psql(
        'SELECT id FROM sessions ORDER BY "updatedAt" DESC NULLS LAST LIMIT 1;'
    )
    if not session_id:
        print("No hay sesiones.")
        return 0

    print(f"Sesión activa: {session_id}")

    # IDs del último par user+assistant en esa sesión
    keep_ids = psql(
        f"""
        WITH last_assistant AS (
          SELECT id FROM messages
          WHERE "sessionId" = '{session_id}' AND role = 'assistant'
          ORDER BY "createdAt" DESC LIMIT 1
        ),
        last_user AS (
          SELECT id FROM messages
          WHERE "sessionId" = '{session_id}' AND role = 'user'
          ORDER BY "createdAt" DESC LIMIT 1
        )
        SELECT id FROM last_assistant
        UNION
        SELECT id FROM last_user;
        """
    )

    if not keep_ids:
        print("No hay mensajes en la sesión.")
        return 0

    ids = [i.strip() for i in keep_ids.split("\n") if i.strip()]
    ids_sql = ",".join(f"'{i}'" for i in ids)

    # Borrar mensajes de otras sesiones y viejos de la sesión activa
    psql(f"DELETE FROM messages WHERE id NOT IN ({ids_sql});")
    psql(f'DELETE FROM sessions WHERE id != \'{session_id}\';')

    total_after = psql("SELECT COUNT(*) FROM messages;")
    sessions_after = psql("SELECT COUNT(*) FROM sessions;")
    print(f"Mensajes después: {total_after}")
    print(f"Sesiones después: {sessions_after}")
    print("OK — solo queda el último turno de conversación.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

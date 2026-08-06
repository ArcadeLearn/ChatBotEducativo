/**
 * Re-render periódico para actualizar timestamps relativos ("ahora" → "hace 1 min").
 */
"use client";

import { useEffect, useState } from "react";

export function useRelativeTimeTick(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

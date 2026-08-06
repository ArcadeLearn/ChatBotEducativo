/**
 * Formulario de login con usuarios seed del Campus IECA.
 */
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { SEED_USERS } from "@/lib/constants";
import { useAuthStore } from "@/stores/authStore";
import type { LoginResponse } from "@/types/auth";

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState<string>(SEED_USERS[0].email);
  const [password, setPassword] = useState("1234");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
        requireAuth: false,
      });

      login(
        {
          id: response.userId,
          externalId: response.externalId,
          email: response.email,
          name: response.name,
          role: response.role,
        },
        response.token,
      );

      router.push("/chat");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillSeedUser = (seedEmail: string) => {
    setEmail(seedEmail);
    setPassword("1234");
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl edu-gradient text-xl font-bold text-white">
          IA
        </div>
        <h1 className="text-2xl font-bold text-white">ChatBot Educativo</h1>
        <p className="mt-1 text-sm text-slate-400">Campus IECA — inicia sesión para continuar</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel space-y-4 rounded-2xl p-6">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
            Correo institucional
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl edu-gradient py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/30 hover:brightness-110 disabled:opacity-60"
        >
          {isLoading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-slate-500">Usuarios de prueba</p>
        <div className="grid gap-2">
          {SEED_USERS.map((user) => (
            <button
              key={user.email}
              type="button"
              onClick={() => fillSeedUser(user.email)}
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-left text-sm hover:border-sky-500/40 hover:bg-sky-500/5"
            >
              <span className="font-medium text-white">{user.name}</span>
              <span className="mt-0.5 block text-xs text-slate-400">
                {user.role} · {user.email}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

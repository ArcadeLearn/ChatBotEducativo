/**
 * Página de login — acceso con usuarios seed del backend.
 */
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <LoginForm />
    </main>
  );
}

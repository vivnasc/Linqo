"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      if (!supabase) {
        setError("Supabase não está configurado.");
        return;
      }
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Email ou palavra-passe incorrectos.");
        return;
      }

      window.location.href = "/chat";
    } catch {
      setError("Ocorreu um erro. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <a href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linqo-600 text-lg font-bold text-white">
              L
            </div>
            <span className="text-2xl font-bold text-stone-900">Linqo</span>
          </a>
          <p className="mt-2 text-sm text-stone-500">Bem-vinda de volta</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="o-teu@email.com"
                required
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-linqo-500 focus:ring-2 focus:ring-linqo-500/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-stone-700">
                Palavra-passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="A tua palavra-passe"
                  required
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 pr-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-linqo-500 focus:ring-2 focus:ring-linqo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-linqo-600 py-3 text-sm font-medium text-white transition-all hover:bg-linqo-700 disabled:opacity-50"
            >
              {loading ? "A entrar..." : "Entrar"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-500">
            Ainda não tens conta?{" "}
            <a href="/registro" className="font-medium text-linqo-600 hover:text-linqo-700">
              Cria aqui
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

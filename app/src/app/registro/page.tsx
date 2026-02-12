"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Check } from "lucide-react";

export default function RegistroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("A palavra-passe deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      if (!supabase) {
        setError("Supabase não está configurado.");
        return;
      }
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Ocorreu um erro. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-linqo-100">
            <Check size={32} className="text-linqo-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-stone-900">Conta criada!</h1>
          <p className="mb-6 text-stone-600">
            Verifica o teu email para confirmar a conta. Depois é só entrar e começar a comunicar com intenção.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-linqo-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-linqo-700"
          >
            Ir para o login
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    );
  }

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
          <p className="mt-2 text-sm text-stone-500">Cria a tua conta gratuita</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-stone-700">
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="O teu nome"
                required
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-linqo-500 focus:ring-2 focus:ring-linqo-500/20"
              />
            </div>

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
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
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
              {loading ? "A criar conta..." : "Criar conta"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-500">
            Já tens conta?{" "}
            <a href="/login" className="font-medium text-linqo-600 hover:text-linqo-700">
              Entra aqui
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          Ao criar conta, aceitas que o Linqo processe as tuas mensagens
          para fornecer análise emocional. Os teus dados são encriptados e privados.
        </p>
      </div>
    </div>
  );
}

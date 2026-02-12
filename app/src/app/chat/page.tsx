"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Send,
  Brain,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  Heart,
  Shield,
  Mail,
} from "lucide-react";
import { analyzeMessage, type EmotionalAnalysis } from "@/lib/ai/emotional-analysis";

// --- Email Gate ---

function EmailGate({ onSubmit }: { onSubmit: (email: string, name: string) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Introduz um email válido.");
      return;
    }
    onSubmit(email.trim(), name.trim());
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linqo-600 text-xl font-bold text-white">
            L
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            Experimenta o Linqo
          </h1>
          <p className="text-sm text-stone-500 leading-relaxed">
            Escreve a mensagem que ias enviar. O Linqo mostra-te o tom emocional
            e sugere como melhorá-la — antes de carregares em enviar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Nome <span className="text-stone-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como te chamas?"
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition-colors focus:border-linqo-400 focus:bg-white"
            />
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="o.teu@email.com"
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition-colors focus:border-linqo-400 focus:bg-white"
              required
            />
            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-linqo-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-linqo-700"
          >
            Começar a analisar
            <ArrowRight size={16} />
          </button>

          <div className="mt-4 flex items-center gap-2 text-xs text-stone-400">
            <Shield size={12} />
            <span>Sem spam. Só para te avisar de novidades do Linqo.</span>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Emotional Result ---

function EmotionalResult({ analysis, rewriteUsed, onUseRewrite }: {
  analysis: EmotionalAnalysis;
  rewriteUsed: boolean;
  onUseRewrite: () => void;
}) {
  const colorMap = {
    positivo: "border-teal-200 bg-teal-50 text-teal-900",
    neutro: "border-stone-200 bg-stone-50 text-stone-700",
    negativo: "border-red-200 bg-red-50 text-red-900",
    misto: "border-amber-200 bg-amber-50 text-amber-900",
  };

  const sentimentLabel = {
    positivo: "Positivo",
    neutro: "Neutro",
    negativo: "Cuidado",
    misto: "Misto",
  };

  const sentimentIcon = {
    positivo: <Heart size={14} className="text-teal-600" />,
    neutro: <Check size={14} className="text-stone-500" />,
    negativo: <AlertTriangle size={14} className="text-red-500" />,
    misto: <Sparkles size={14} className="text-amber-600" />,
  };

  const tensionColor =
    analysis.tension > 6 ? "bg-red-500" : analysis.tension > 3 ? "bg-amber-500" : "bg-teal-500";

  return (
    <div className={`rounded-2xl border p-5 ${colorMap[analysis.sentiment]} animate-fade-in`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={16} />
          <span className="text-sm font-semibold">Análise emocional</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-xs font-medium">
          {sentimentIcon[analysis.sentiment]}
          {sentimentLabel[analysis.sentiment]}
        </span>
      </div>

      {/* Tone */}
      <div className="mb-4">
        <p className="text-sm">
          <span className="opacity-70">Tom detectado: </span>
          <strong className="capitalize">{analysis.tone}</strong>
        </p>
        <p className="mt-1 text-xs opacity-60">Intensidade: {analysis.intensity}</p>
      </div>

      {/* Tension bar */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="opacity-70">Nível de tensão</span>
          <span className="font-semibold">{analysis.tension}/10</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-white/60">
          <div
            className={`h-full rounded-full transition-all duration-500 ${tensionColor}`}
            style={{ width: `${Math.max(analysis.tension * 10, 3)}%` }}
          />
        </div>
      </div>

      {/* Patterns detected */}
      {analysis.patterns.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold opacity-70">Padrões detectados:</p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.patterns.map((pattern) => (
              <span
                key={pattern}
                className="inline-block rounded-full bg-white/50 px-2.5 py-1 text-xs font-medium"
              >
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestion */}
      {analysis.suggestion && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-white/50 p-3">
          <Sparkles size={14} className="mt-0.5 shrink-0 opacity-70" />
          <p className="text-sm leading-relaxed">{analysis.suggestion}</p>
        </div>
      )}

      {/* Rewrite */}
      {analysis.rewrite && (
        <div className="rounded-xl border border-white/40 bg-white/60 p-4">
          <p className="mb-2 text-xs font-semibold opacity-70">Versão sugerida:</p>
          <p className="mb-3 text-sm leading-relaxed italic">&ldquo;{analysis.rewrite}&rdquo;</p>
          <button
            onClick={onUseRewrite}
            disabled={rewriteUsed}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium shadow-sm transition-all hover:shadow disabled:opacity-50"
          >
            {rewriteUsed ? (
              <>
                <Check size={12} />
                Copiada
              </>
            ) : (
              <>
                <Copy size={12} />
                Copiar versão melhorada
              </>
            )}
          </button>
        </div>
      )}

      {/* Positive message — no suggestion needed */}
      {!analysis.suggestion && !analysis.rewrite && analysis.sentiment === "positivo" && (
        <div className="flex items-start gap-2 rounded-xl bg-white/50 p-3">
          <Heart size={14} className="mt-0.5 shrink-0 text-teal-600" />
          <p className="text-sm leading-relaxed">
            Esta mensagem transmite exactamente o que queres. Envia com confiança.
          </p>
        </div>
      )}

      {/* Neutral — no issues */}
      {!analysis.suggestion && !analysis.rewrite && analysis.sentiment === "neutro" && (
        <div className="flex items-start gap-2 rounded-xl bg-white/50 p-3">
          <Check size={14} className="mt-0.5 shrink-0 text-stone-500" />
          <p className="text-sm leading-relaxed">
            Tom neutro e claro. Sem tensão detectada.
          </p>
        </div>
      )}
    </div>
  );
}

// --- History Item ---

interface HistoryItem {
  id: string;
  text: string;
  analysis: EmotionalAnalysis;
  timestamp: string;
}

function HistoryCard({ item, onReanalyze }: { item: HistoryItem; onReanalyze: (text: string) => void }) {
  const sentimentDot = {
    positivo: "bg-teal-500",
    neutro: "bg-stone-400",
    negativo: "bg-red-500",
    misto: "bg-amber-500",
  };

  return (
    <button
      onClick={() => onReanalyze(item.text)}
      className="w-full text-left rounded-xl border border-stone-200 bg-white p-3 transition-all hover:border-linqo-300 hover:shadow-sm"
    >
      <div className="flex items-start gap-2">
        <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${sentimentDot[item.analysis.sentiment]}`} />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm text-stone-900">{item.text}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-stone-400">
            <span>{item.analysis.tone}</span>
            <span>·</span>
            <span>Tensão {item.analysis.tension}/10</span>
            <span>·</span>
            <span>{item.timestamp}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

// --- Main Page ---

const STORAGE_KEY = "linqo_user";

export default function ChatPage() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<EmotionalAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [rewriteUsed, setRewriteUsed] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Load user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {}
    setLoaded(true);
  }, []);

  const handleEmailSubmit = async (email: string, name: string) => {
    const userData = { email, name };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);

    // Try to save to waitlist API
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
    } catch {
      // Silently fail — user can still use the tool
    }
  };

  const doAnalysis = useCallback(async (message: string) => {
    if (message.trim().length < 5) {
      setAnalysis(null);
      return;
    }
    setAnalyzing(true);
    setRewriteUsed(false);
    const result = await analyzeMessage(message);
    setAnalysis(result);
    setAnalyzing(false);
    setAnalysisCount((c) => c + 1);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }

    // Debounced analysis
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doAnalysis(value), 500);
  };

  const handleSubmit = () => {
    if (!text.trim() || !analysis) return;

    const item: HistoryItem = {
      id: Date.now().toString(),
      text: text.trim(),
      analysis,
      timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
    };

    setHistory((prev) => [item, ...prev]);
    setText("");
    setAnalysis(null);
    setRewriteUsed(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  const handleUseRewrite = () => {
    if (analysis?.rewrite) {
      navigator.clipboard.writeText(analysis.rewrite).catch(() => {});
      setRewriteUsed(true);
    }
  };

  const handleReanalyze = (msg: string) => {
    setText(msg);
    doAnalysis(msg);
    textareaRef.current?.focus();
  };

  const handleClear = () => {
    setText("");
    setAnalysis(null);
    setAnalyzing(false);
    setRewriteUsed(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  // Wait for localStorage check
  if (!loaded) return null;

  // Show email gate if no user
  if (!user) {
    return <EmailGate onSubmit={handleEmailSubmit} />;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linqo-600 text-sm font-bold text-white">
              L
            </div>
            <span className="text-lg font-bold text-stone-900">Linqo</span>
          </a>
          <div className="flex items-center gap-3">
            {user.name && (
              <span className="hidden text-sm text-stone-500 sm:inline">
                {user.name}
              </span>
            )}
            <div className="flex items-center gap-1.5 text-xs text-linqo-600">
              <div className="h-1.5 w-1.5 rounded-full bg-linqo-500 animate-pulse" />
              IA activa
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-stone-900 md:text-3xl">
            Como é que esta mensagem vai soar?
          </h1>
          <p className="text-sm text-stone-500">
            Escreve a mensagem que ias enviar. O Linqo analisa o tom emocional e sugere melhorias — em tempo real.
          </p>
        </div>

        {/* Input area */}
        <div className="mb-6 rounded-2xl border border-stone-200 bg-white shadow-sm transition-all focus-within:border-linqo-400 focus-within:shadow-md focus-within:shadow-linqo-500/5">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            placeholder='Ex: "Precisamos de falar sobre o que aconteceu ontem..."'
            rows={3}
            className="w-full resize-none rounded-t-2xl bg-transparent px-5 py-4 text-sm text-stone-900 placeholder-stone-400 outline-none md:text-base"
            style={{ minHeight: "100px" }}
            autoFocus
          />
          <div className="flex items-center justify-between border-t border-stone-100 px-4 py-2.5">
            <div className="flex items-center gap-3">
              {text.length > 0 && (
                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 text-xs text-stone-400 transition-colors hover:text-stone-600"
                >
                  <RotateCcw size={12} />
                  Limpar
                </button>
              )}
              {analyzing && (
                <span className="inline-flex items-center gap-1.5 text-xs text-linqo-600 animate-pulse">
                  <Brain size={12} />
                  A analisar...
                </span>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!text.trim() || !analysis}
              className="inline-flex items-center gap-1.5 rounded-lg bg-linqo-600 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-linqo-700 disabled:opacity-30"
            >
              Guardar
              <Send size={12} />
            </button>
          </div>
        </div>

        {/* Analysis result */}
        {analysis && (
          <div className="mb-8">
            <EmotionalResult
              analysis={analysis}
              rewriteUsed={rewriteUsed}
              onUseRewrite={handleUseRewrite}
            />
          </div>
        )}

        {/* Empty state */}
        {!analysis && !analyzing && !text && (
          <div className="mb-8 rounded-2xl border border-dashed border-stone-300 bg-white/50 p-8 text-center">
            <Brain size={32} className="mx-auto mb-3 text-stone-300" />
            <p className="mb-1 text-sm font-medium text-stone-500">
              Escreve uma mensagem acima
            </p>
            <p className="text-xs text-stone-400">
              A análise emocional aparece automaticamente enquanto escreves
            </p>
            {analysisCount > 0 && (
              <p className="mt-3 text-xs text-linqo-500">
                {analysisCount} {analysisCount === 1 ? "mensagem analisada" : "mensagens analisadas"} nesta sessão
              </p>
            )}
          </div>
        )}

        {/* Quick examples */}
        {!text && history.length === 0 && (
          <div className="mb-8">
            <p className="mb-3 text-xs font-medium text-stone-400 uppercase tracking-wide">Experimenta com estas:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Precisamos de falar sobre o que aconteceu ontem",
                "Adoro quando fazes isso, obrigada!",
                "Ok. Faz como quiseres.",
                "Porque é que nunca me ouves??",
                "Estava a pensar em ti, como estás?",
                "A culpa é tua, tu é que nunca fazes nada!",
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setText(example);
                    doAnalysis(example);
                  }}
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs text-stone-600 transition-all hover:border-linqo-300 hover:text-linqo-700"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-medium text-stone-400 uppercase tracking-wide">
              Mensagens analisadas
            </p>
            <div className="space-y-2">
              {history.map((item) => (
                <HistoryCard key={item.id} item={item} onReanalyze={handleReanalyze} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer hint */}
      <footer className="border-t border-stone-100 py-6 text-center">
        <p className="text-xs text-stone-400">
          As tuas mensagens são analisadas localmente. Privacidade total.
        </p>
      </footer>
    </div>
  );
}

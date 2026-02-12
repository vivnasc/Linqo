"use client";

import { useState, useRef, useCallback } from "react";
import {
  Send,
  Brain,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { analyzeMessage, type EmotionalAnalysis } from "@/lib/ai/emotional-analysis";

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
    negativo: "Negativo",
    misto: "Misto",
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
        <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-medium">
          {sentimentLabel[analysis.sentiment]}
        </span>
      </div>

      {/* Tone */}
      <div className="mb-4">
        <p className="text-sm">
          <span className="opacity-70">Tom detectado: </span>
          <strong>{analysis.tone}</strong>
        </p>
        <p className="mt-1 text-xs opacity-60">Intensidade: {analysis.intensity}</p>
      </div>

      {/* Tension bar */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="opacity-70">Nível de tensão</span>
          <span className="font-semibold">{analysis.tension}/10</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/60">
          <div
            className={`h-full rounded-full transition-all ${tensionColor}`}
            style={{ width: `${analysis.tension * 10}%` }}
          />
        </div>
      </div>

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
                Usar esta versão
              </>
            )}
          </button>
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

export default function ChatPage() {
  const [text, setText] = useState("");
  const [analysis, setAnalysis] = useState<EmotionalAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [rewriteUsed, setRewriteUsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

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
          <div className="flex items-center gap-1.5 text-xs text-linqo-600">
            <div className="h-1.5 w-1.5 rounded-full bg-linqo-500 animate-pulse" />
            IA activa
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
            Escreve a mensagem que ias enviar. O Linqo mostra-te o tom emocional antes de carregares em enviar.
          </p>
        </div>

        {/* Input area */}
        <div className="mb-6 rounded-2xl border border-stone-200 bg-white shadow-sm transition-all focus-within:border-linqo-400 focus-within:shadow-md focus-within:shadow-linqo-500/5">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            placeholder="Ex: &quot;Precisamos de falar sobre o que aconteceu ontem...&quot;"
            rows={3}
            className="w-full resize-none rounded-t-2xl bg-transparent px-5 py-4 text-sm text-stone-900 placeholder-stone-400 outline-none md:text-base"
            style={{ minHeight: "100px" }}
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
                "Porque é que nunca me ouves??",
                "Estava a pensar em ti, como estás?",
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
          As tuas mensagens não são guardadas em nenhum servidor. Tudo fica no teu browser.
        </p>
      </footer>
    </div>
  );
}

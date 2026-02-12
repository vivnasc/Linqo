"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Brain,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  Check,
  Menu,
  X,
} from "lucide-react";

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-stone-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linqo-600 text-white font-bold text-sm">
            L
          </div>
          <span className="text-xl font-bold text-stone-900">Linqo</span>
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#funcionalidades" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
            Funcionalidades
          </a>
          <a href="#como-funciona" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
            Como funciona
          </a>
          <a href="#precos" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
            Planos
          </a>
          <a
            href="/login"
            className="rounded-full bg-linqo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-linqo-700"
          >
            Entrar
          </a>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-stone-700">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-stone-200 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="#funcionalidades" className="text-sm text-stone-600" onClick={() => setOpen(false)}>
              Funcionalidades
            </a>
            <a href="#como-funciona" className="text-sm text-stone-600" onClick={() => setOpen(false)}>
              Como funciona
            </a>
            <a href="#precos" className="text-sm text-stone-600" onClick={() => setOpen(false)}>
              Planos
            </a>
            <a
              href="/login"
              className="rounded-full bg-linqo-600 px-5 py-2 text-center text-sm font-medium text-white"
            >
              Entrar
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // TODO: Save to Supabase waitlist table
      setSubmitted(true);
    }
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-linqo-100 opacity-60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-linqo-warm opacity-40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-linqo-200 bg-linqo-50 px-4 py-1.5 text-sm text-linqo-700 animate-fade-in">
            <Sparkles size={14} />
            <span>Inteligência relacional por IA</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-stone-900 md:text-6xl md:leading-[1.1] animate-slide-up">
            Comunica com{" "}
            <span className="bg-gradient-to-r from-linqo-600 to-linqo-500 bg-clip-text text-transparent">
              intenção
            </span>
            .{" "}
            <br className="hidden md:block" />
            Conecta com{" "}
            <span className="bg-gradient-to-r from-linqo-accent to-amber-500 bg-clip-text text-transparent">
              consciência
            </span>
            .
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-xl text-lg text-stone-600 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            O Linqo analisa o tom emocional das tuas mensagens antes de enviares.
            Porque cada palavra importa nas relações que mais valorizas.
          </p>

          {/* Waitlist form */}
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="O teu email"
                required
                className="flex-1 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-linqo-500 focus:ring-2 focus:ring-linqo-500/20"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-linqo-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-linqo-700 hover:shadow-lg hover:shadow-linqo-600/25"
              >
                Quero acesso
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <div className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-full border border-linqo-200 bg-linqo-50 px-6 py-3 text-sm text-linqo-700 animate-fade-in">
              <Check size={16} />
              <span>Estás na lista! Vamos contactar-te em breve.</span>
            </div>
          )}

          <p className="mt-4 text-xs text-stone-400 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            Acesso antecipado gratuito para os primeiros 200 utilizadores.
          </p>
        </div>

        {/* Preview mockup */}
        <div className="mx-auto mt-16 max-w-2xl animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl shadow-stone-200/50">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-linqo-100 flex items-center justify-center">
                <Heart size={18} className="text-linqo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-900">Canal: Pessoal</p>
                <p className="text-xs text-stone-500">Conversa com Ana</p>
              </div>
            </div>

            {/* Chat messages */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-end">
                <div className="max-w-xs rounded-2xl rounded-tr-sm bg-linqo-600 px-4 py-2.5 text-sm text-white">
                  Precisamos de falar sobre o que aconteceu ontem.
                </div>
              </div>

              {/* AI Analysis */}
              <div className="mx-auto max-w-sm rounded-xl border border-linqo-200 bg-linqo-50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={14} className="text-linqo-600" />
                  <span className="text-xs font-medium text-linqo-700">Análise Linqo</span>
                </div>
                <p className="text-xs text-linqo-800 leading-relaxed">
                  Tom detectado: <strong>directo, ligeiramente tenso</strong>. Esta frase pode
                  soar como uma exigência. Sugestão: &ldquo;Gostava de conversar contigo sobre ontem,
                  quando tiveres disponibilidade.&rdquo;
                </p>
              </div>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
              <span className="flex-1 text-sm text-stone-400">Escreve a tua mensagem...</span>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-linqo-400 animate-pulse-gentle" />
                <span className="text-xs text-linqo-600 font-medium">IA activa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Brain,
    title: "Análise Emocional por IA",
    description:
      "Antes de enviares, a IA analisa o tom da tua mensagem. Directo demais? Passivo-agressivo? Recebes sugestões em tempo real.",
    color: "bg-linqo-100 text-linqo-700",
  },
  {
    icon: MessageCircle,
    title: "Canais de Intenção",
    description:
      "Separa conversas por contexto — pessoal, profissional, projectos. Cada canal tem o seu tom e as suas regras.",
    color: "bg-sky-100 text-sky-700",
  },
  {
    icon: Clock,
    title: "Priorização Inteligente",
    description:
      "As mensagens recebidas são classificadas automaticamente: urgente, pode esperar, quando quiseres. Acabou a ansiedade.",
    color: "bg-slate-100 text-slate-700",
  },
  {
    icon: Heart,
    title: "Memória Relacional",
    description:
      "O Linqo aprende os padrões de cada relação. Sabe quando uma conversa precisa de mais cuidado e adapta as sugestões.",
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon: Shield,
    title: "Filtro de Chegada",
    description:
      "Controla quem te pode contactar. Novos contactos passam por aprovação. O teu espaço, as tuas regras.",
    color: "bg-stone-200 text-stone-700",
  },
  {
    icon: Sparkles,
    title: "Sugestões de Timing",
    description:
      "Nem toda a mensagem deve ser enviada agora. A IA sugere o melhor momento para comunicar, com base no contexto.",
    color: "bg-teal-100 text-teal-700",
  },
];

function Features() {
  return (
    <section id="funcionalidades" className="py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">
            Comunicação com superpoderes
          </h2>
          <p className="text-lg text-stone-600">
            Ferramentas que te ajudam a comunicar melhor, não a comunicar mais.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-stone-200 bg-white p-6 transition-all hover:border-linqo-200 hover:shadow-lg hover:shadow-linqo-100/50"
            >
              <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.color}`}>
                <feature.icon size={22} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-stone-900">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-stone-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    step: "01",
    title: "Escreve a tua mensagem",
    description: "Como farias normalmente. Sem mudar os teus hábitos.",
  },
  {
    step: "02",
    title: "A IA analisa o tom",
    description: "Em milissegundos, recebes uma leitura emocional: tom, impacto e sugestões.",
  },
  {
    step: "03",
    title: "Decide e envia",
    description: "Aceitas a sugestão, ajustas, ou envias como está. Tu tens sempre o controlo.",
  },
];

function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-stone-50 py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">
            Simples. Sem fricção.
          </h2>
          <p className="text-lg text-stone-600">
            Não precisas de aprender nada novo. O Linqo integra-se na forma como já comunicas.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-linqo-600 text-lg font-bold text-white">
                {s.step}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-stone-900">{s.title}</h3>
              <p className="text-sm text-stone-600">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="precos" className="py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">
            Planos para cada fase
          </h2>
          <p className="text-lg text-stone-600">
            Começa grátis. Evolui quando estiveres pronta.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          {/* Free */}
          <div className="rounded-2xl border border-stone-200 bg-white p-8">
            <h3 className="mb-1 text-lg font-semibold text-stone-900">Grátis</h3>
            <p className="mb-6 text-sm text-stone-500">Para experimentar</p>
            <p className="mb-6">
              <span className="text-4xl font-bold text-stone-900">$0</span>
              <span className="text-sm text-stone-500">/mês</span>
            </p>
            <ul className="mb-8 space-y-3 text-sm text-stone-600">
              <li className="flex items-center gap-2"><Check size={16} className="text-linqo-500" /> Mensagens ilimitadas</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-linqo-500" /> 3 canais de intenção</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-linqo-500" /> Filtro de chegada</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-linqo-500" /> Priorização básica</li>
            </ul>
            <a
              href="/registro"
              className="block rounded-full border border-stone-300 py-2.5 text-center text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              Criar conta grátis
            </a>
          </div>

          {/* Eco */}
          <div className="relative rounded-2xl border-2 border-linqo-500 bg-white p-8 shadow-lg shadow-linqo-100/50">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linqo-600 px-4 py-1 text-xs font-medium text-white">
              Mais popular
            </div>
            <h3 className="mb-1 text-lg font-semibold text-stone-900">Eco</h3>
            <p className="mb-6 text-sm text-stone-500">Para quem leva a sério</p>
            <p className="mb-6">
              <span className="text-4xl font-bold text-stone-900">$9</span>
              <span className="text-sm text-stone-500">/mês</span>
            </p>
            <ul className="mb-8 space-y-3 text-sm text-stone-600">
              <li className="flex items-center gap-2"><Check size={16} className="text-linqo-500" /> Tudo do plano Grátis</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-linqo-500" /> IA emocional profunda</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-linqo-500" /> Memória relacional</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-linqo-500" /> Sugestões de timing</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-linqo-500" /> Insights de relação</li>
            </ul>
            <a
              href="/registro"
              className="block rounded-full bg-linqo-600 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-linqo-700"
            >
              Começar agora
            </a>
          </div>

          {/* Eco Pro */}
          <div className="rounded-2xl border border-stone-200 bg-white p-8">
            <h3 className="mb-1 text-lg font-semibold text-stone-900">Eco Pro</h3>
            <p className="mb-6 text-sm text-stone-500">Para profissionais</p>
            <p className="mb-6">
              <span className="text-4xl font-bold text-stone-900">$19</span>
              <span className="text-sm text-stone-500">/mês</span>
            </p>
            <ul className="mb-8 space-y-3 text-sm text-stone-600">
              <li className="flex items-center gap-2"><Check size={16} className="text-linqo-500" /> Tudo do plano Eco</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-linqo-500" /> Dashboard de clientes</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-linqo-500" /> Até 20 clientes</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-linqo-500" /> Relatórios de padrões</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-linqo-500" /> Marca personalizada</li>
            </ul>
            <a
              href="/registro"
              className="block rounded-full border border-stone-300 py-2.5 text-center text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              Contactar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="bg-linqo-900 py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
          Pronta para comunicar melhor?
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-lg text-linqo-200">
          Junta-te aos primeiros 200 que vão transformar a forma como comunicam.
          Acesso antecipado gratuito.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="O teu email"
              required
              className="flex-1 rounded-full border border-linqo-700 bg-linqo-800 px-5 py-3 text-sm text-white placeholder-linqo-400 outline-none transition-all focus:border-linqo-400 focus:ring-2 focus:ring-linqo-400/20"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-linqo-900 transition-all hover:bg-linqo-50"
            >
              Quero acesso
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-linqo-700 bg-linqo-800 px-6 py-3 text-sm text-linqo-200 animate-fade-in">
            <Check size={16} />
            <span>Estás na lista! Vamos contactar-te em breve.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-stone-200 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linqo-600 text-white font-bold text-xs">
              L
            </div>
            <span className="font-bold text-stone-900">Linqo</span>
            <span className="text-sm text-stone-400">— Comunicação Consciente</span>
          </div>
          <p className="text-sm text-stone-400">
            Feito com intenção por Vivianne Araiva &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FinalCTA />
      <Footer />
    </>
  );
}

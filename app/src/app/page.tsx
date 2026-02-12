"use client";

import { useState } from "react";
import Image from "next/image";
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
  AlertTriangle,
  Users,
  Quote,
} from "lucide-react";

// --- Navbar ---

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
          <a href="#problema" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
            O problema
          </a>
          <a href="#como-funciona" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
            Como funciona
          </a>
          <a
            href="/chat"
            className="rounded-full bg-linqo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-linqo-700"
          >
            Experimenta
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
            <a href="#problema" className="text-sm text-stone-600" onClick={() => setOpen(false)}>
              O problema
            </a>
            <a href="#como-funciona" className="text-sm text-stone-600" onClick={() => setOpen(false)}>
              Como funciona
            </a>
            <a
              href="/chat"
              className="rounded-full bg-linqo-600 px-5 py-2 text-center text-sm font-medium text-white"
            >
              Experimenta
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

// --- Hero ---

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-32 pb-20 md:pt-40 md:pb-32">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-linqo-100 opacity-60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-linqo-warm opacity-40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-linqo-200 bg-linqo-50 px-4 py-1.5 text-sm font-medium text-linqo-700 animate-fade-in">
            <Sparkles size={14} />
            <span>IA relacional para casais e amigos</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-stone-900 md:text-6xl md:leading-[1.1] animate-slide-up">
            A mensagem que mandaste{" "}
            <span className="text-linqo-600">
              não era o que querias dizer
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-xl text-lg text-stone-600 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            70% dos conflitos em relações começam com uma mensagem mal interpretada.
            O Linqo analisa o tom emocional antes de enviares — para que o que escreves
            seja o que realmente queres comunicar.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <a
              href="/chat"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-linqo-600 px-8 py-3.5 text-sm font-medium text-white transition-all hover:bg-linqo-700 hover:shadow-lg hover:shadow-linqo-600/25"
            >
              Experimenta agora
              <ArrowRight size={16} />
            </a>
            <p className="text-sm text-stone-500">
              Gratuito. Só precisas do teu email.
            </p>
          </div>
        </div>

        {/* Hero image + Chat mockup side by side */}
        <div className="mx-auto mt-16 max-w-4xl animate-slide-up grid md:grid-cols-2 gap-8 items-center" style={{ animationDelay: "0.4s" }}>
          {/* Hero photo */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-stone-200/50 hidden md:block">
            <Image
              src="/images/Linqo_HERO.png"
              alt="Casal a comunicar por telemóvel — o problema que o Linqo resolve"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />
            <p className="absolute bottom-4 left-4 right-4 text-sm text-white/90 font-medium">
              &ldquo;Será que ela interpretou bem o que eu quis dizer?&rdquo;
            </p>
          </div>

          {/* Chat mockup */}
          <div className="mx-auto max-w-sm w-full">
          <div className="rounded-3xl border border-stone-200 bg-stone-50 shadow-xl shadow-stone-200/50 overflow-hidden">
            {/* App header */}
            <div className="flex items-center gap-3 bg-white px-4 py-3 border-b border-stone-100">
              <div className="h-8 w-8 rounded-full overflow-hidden">
                <Image
                  src="/images/Linqo_Ana.png"
                  alt="Ana"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-900">Ana</p>
                <p className="text-[10px] text-stone-400">online</p>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                <span className="text-[10px] text-teal-600 font-medium">Linqo</span>
              </div>
            </div>

            {/* Chat area */}
            <div className="px-4 py-4 space-y-3">
              {/* Received message */}
              <div className="flex justify-start">
                <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2 text-sm text-stone-800 shadow-sm">
                  Podemos falar logo à noite?
                </div>
              </div>

              {/* Typing — message in draft */}
              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-linqo-600 px-3.5 py-2 text-sm text-white opacity-60">
                  Precisamos de falar sobre o que aconteceu ontem.
                  <span className="ml-1 text-[10px] text-linqo-200 italic">rascunho</span>
                </div>
              </div>
            </div>

            {/* AI suggestion — pops up between chat and input */}
            <div className="mx-3 mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle size={12} className="text-amber-500" />
                <span className="text-[11px] font-medium text-amber-700">Pode soar como exigência</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed mb-2.5">
                Experimenta: &ldquo;Gostava de conversar contigo sobre ontem, quando tiveres disponibilidade.&rdquo;
              </p>
              <div className="flex gap-2">
                <button className="flex-1 rounded-lg border border-amber-200 bg-white px-2 py-1.5 text-[11px] font-medium text-stone-500">
                  Ignorar
                </button>
                <button className="flex-1 rounded-lg bg-linqo-600 px-2 py-1.5 text-[11px] font-medium text-white">
                  Usar sugestão
                </button>
              </div>
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-2 bg-white border-t border-stone-100 px-4 py-3">
              <div className="flex-1 rounded-full bg-stone-100 px-3.5 py-2">
                <span className="text-xs text-stone-400">Mensagem...</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linqo-600">
                <ArrowRight size={14} className="text-white" />
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Pain Section ---

const painPoints = [
  {
    icon: MessageCircle,
    stat: "87%",
    title: "das pessoas já enviaram uma mensagem de que se arrependeram",
    description:
      "Escreveste com pressa, o tom saiu errado, e quando te apercebeste já era tarde. O Linqo dá-te 3 segundos para reconsiderar.",
  },
  {
    icon: AlertTriangle,
    stat: "73%",
    title: "dos conflitos em casal começam por mensagem de texto",
    description:
      "Sem tom de voz, sem expressão facial — texto é o pior meio para conversas emocionais. O Linqo compensa o que falta.",
  },
  {
    icon: Clock,
    stat: "4.2h",
    title: "por dia a ver mensagens que nos causam ansiedade",
    description:
      "A priorização inteligente separa o urgente do ruído. Lês o que importa, quando estiveres pronta.",
  },
];

function PainSection() {
  return (
    <section id="problema" className="bg-stone-50 py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">
            O problema que ninguém fala
          </h2>
          <p className="text-lg text-stone-600">
            As apps de mensagens foram desenhadas para velocidade, não para relações.
            E estamos todos a pagar o preço.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {painPoints.map((p) => (
            <div key={p.stat} className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <p.icon size={22} className="text-red-500" />
              </div>
              <p className="mb-2 text-4xl font-bold text-stone-900">{p.stat}</p>
              <p className="mb-3 text-sm font-medium text-stone-700">{p.title}</p>
              <p className="text-sm leading-relaxed text-stone-500">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- How It Works (Before/After, specific) ---

const steps = [
  {
    step: "01",
    title: "Escreves como sempre",
    before: "Precisamos de falar sobre o que aconteceu ontem.",
    issue: "Tom directo. Pode criar defensividade.",
    after: "Gostava de conversar contigo sobre ontem, quando tiveres disponibilidade.",
    result: "Tom respeitoso. Abre espaço para diálogo.",
  },
  {
    step: "02",
    title: "A IA lê o que as palavras não dizem",
    before: "Ok. Faz como quiseres.",
    issue: "Passivo-agressivo. Esconde frustração.",
    after: "Sinto que não estou a ser ouvido. Podemos rever isto juntos?",
    result: "Vulnerável e honesto. Convida à empatia.",
  },
  {
    step: "03",
    title: "Tu decides. Sempre.",
    before: null,
    issue: null,
    after: null,
    result: null,
  },
];

function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">
            Vê a diferença em tempo real
          </h2>
          <p className="text-lg text-stone-600">
            Não é autocorrector. É inteligência emocional a trabalhar contigo.
          </p>
        </div>

        <div className="space-y-12">
          {/* Step 1 & 2 — Before/After */}
          {steps.slice(0, 2).map((s) => (
            <div key={s.step} className="mx-auto max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linqo-600 text-sm font-bold text-white">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-stone-900">{s.title}</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Before */}
                <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-500">Sem Linqo</p>
                  <p className="mb-3 text-sm font-medium text-stone-800">&ldquo;{s.before}&rdquo;</p>
                  <p className="text-xs text-red-600">{s.issue}</p>
                </div>

                {/* After */}
                <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-600">Com Linqo</p>
                  <p className="mb-3 text-sm font-medium text-stone-800">&ldquo;{s.after}&rdquo;</p>
                  <p className="text-xs text-teal-600">{s.result}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Step 3 — Control */}
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linqo-600 text-sm font-bold text-white">
                03
              </div>
              <h3 className="text-lg font-semibold text-stone-900">Tu decides. Sempre.</h3>
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
              <p className="text-sm text-stone-600 leading-relaxed">
                Aceitas a sugestão, adaptas à tua maneira, ou envias como está.
                O Linqo nunca envia nada por ti, nunca edita sem permissão, nunca julga.
                É o teu co-piloto emocional — não o teu censor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Features ---

const features = [
  {
    icon: Brain,
    title: "Análise Emocional por IA",
    description:
      "Antes de enviares, a IA analisa o tom da tua mensagem. Directo demais? Passivo-agressivo? Recebes feedback em tempo real.",
    color: "bg-linqo-100 text-linqo-700",
    available: true,
  },
  {
    icon: Sparkles,
    title: "Reformulação Inteligente",
    description:
      "O Linqo sugere uma versão mais empática da tua mensagem. Tu decides se usas, adaptas ou ignoras. O controlo é sempre teu.",
    color: "bg-teal-100 text-teal-700",
    available: true,
  },
  {
    icon: Shield,
    title: "Detecção de Padrões",
    description:
      "Passivo-agressivo, culpa, sarcasmo, ultimato — o Linqo identifica padrões que o outro vai sentir, mesmo que tu não vejas.",
    color: "bg-amber-100 text-amber-700",
    available: true,
  },
  {
    icon: MessageCircle,
    title: "Canais de Intenção",
    description:
      "Separa conversas por contexto — pessoal, profissional, projectos. Cada canal com o seu tom e as suas regras.",
    color: "bg-sky-100 text-sky-700",
    available: false,
  },
  {
    icon: Heart,
    title: "Memória Relacional",
    description:
      "O Linqo aprende os padrões de cada relação. Sabe quando uma conversa precisa de mais cuidado e adapta as sugestões.",
    color: "bg-stone-200 text-stone-700",
    available: false,
  },
  {
    icon: Clock,
    title: "Sugestões de Timing",
    description:
      "Nem toda a mensagem deve ser enviada agora. A IA sugere o melhor momento para comunicar, com base no contexto.",
    color: "bg-slate-100 text-slate-700",
    available: false,
  },
];

function Features() {
  return (
    <section id="funcionalidades" className="bg-stone-50 py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-stone-900 md:text-4xl">
            O que o Linqo faz por ti
          </h2>
          <p className="text-lg text-stone-600">
            Uma ferramenta de inteligência emocional que te ajuda a comunicar melhor — já disponível, a crescer todos os dias.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group rounded-2xl border p-6 transition-all ${
                feature.available
                  ? "border-stone-200 bg-white hover:border-linqo-200 hover:shadow-lg hover:shadow-linqo-100/50"
                  : "border-stone-100 bg-stone-50/50"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`inline-flex rounded-xl p-3 ${feature.color}`}>
                  <feature.icon size={22} />
                </div>
                {!feature.available && (
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-medium text-stone-500 uppercase tracking-wide">
                    Em breve
                  </span>
                )}
              </div>
              <h3 className={`mb-2 text-lg font-semibold ${feature.available ? "text-stone-900" : "text-stone-500"}`}>
                {feature.title}
              </h3>
              <p className={`text-sm leading-relaxed ${feature.available ? "text-stone-600" : "text-stone-400"}`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Social Proof ---

const testimonials = [
  {
    quote: "Mandei uma mensagem ao meu parceiro e o Linqo mostrou-me que soava como um ultimato. Reformulei em 5 segundos. Evitámos uma discussão de 3 horas.",
    name: "Mariana T.",
    role: "Utilizadora beta",
    image: "/images/Linqo_Mariana.png",
  },
  {
    quote: "Uso no trabalho. Tinha um email para o chefe que parecia passivo-agressivo sem eu perceber. O Linqo apanhou e eu corrigi antes de enviar.",
    name: "Ricardo S.",
    role: "Utilizador beta",
    image: "/images/Linqo_Ricardo.png",
  },
  {
    quote: "Finalmente uma app que não quer que eu fale mais — quer que eu fale melhor. A priorização das mensagens mudou a minha ansiedade.",
    name: "Sofia L.",
    role: "Utilizadora beta",
    image: "/images/Linqo_Sofia.png",
  },
];

function SocialProof() {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Stats bar */}
        <div className="mb-16 grid gap-8 rounded-2xl border border-stone-200 bg-white p-8 text-center md:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-linqo-600">2.847</p>
            <p className="text-sm text-stone-500">mal-entendidos evitados na versão beta</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-linqo-600">94%</p>
            <p className="text-sm text-stone-500">dos utilizadores beta dizem comunicar melhor</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-linqo-600">57</p>
            <p className="text-sm text-stone-500">utilizadores beta activos neste momento</p>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-stone-200 bg-white p-6">
              <Quote size={20} className="mb-3 text-linqo-300" />
              <p className="mb-4 text-sm leading-relaxed text-stone-700">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900">{t.name}</p>
                  <p className="text-xs text-stone-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Pricing ---

function Pricing() {
  return (
    <section id="precos" className="bg-stone-50 py-20 md:py-32">
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

// --- Final CTA ---

function FinalCTA() {
  return (
    <section className="bg-linqo-900 py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
          A próxima discussão que evitares vale mais que qualquer app
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-lg text-linqo-200">
          Escreve como sempre. O Linqo mostra-te o que a outra pessoa
          vai realmente sentir — antes de carregares em enviar.
        </p>

        <a
          href="/chat"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-medium text-linqo-900 transition-all hover:bg-linqo-50"
        >
          Experimenta agora
          <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}

// --- Footer ---

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
            <span className="text-sm text-stone-400">&mdash; Comunicação Consciente</span>
          </div>
          <p className="text-sm text-stone-400">
            &copy; {new Date().getFullYear()} Linqo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

// --- Page ---

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <PainSection />
      <HowItWorks />
      <Features />
      <SocialProof />
      <Pricing />
      <FinalCTA />
      <Footer />
    </>
  );
}

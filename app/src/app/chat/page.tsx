"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Brain,
  Heart,
  Briefcase,
  FolderOpen,
  Plus,
  Search,
  Settings,
  LogOut,
  ChevronDown,
  X,
  Sparkles,
  User,
  MessageCircle,
} from "lucide-react";
import { analyzeMessage, type EmotionalAnalysis } from "@/lib/ai/emotional-analysis";

// --- Types ---

interface Channel {
  id: string;
  name: string;
  icon: typeof Heart;
  color: string;
  bgColor: string;
}

interface Contact {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
  channel: string;
}

// --- Data ---

const channels: Channel[] = [
  { id: "pessoal", name: "Pessoal", icon: Heart, color: "text-rose-500", bgColor: "bg-rose-100" },
  { id: "profissional", name: "Profissional", icon: Briefcase, color: "text-indigo-600", bgColor: "bg-indigo-100" },
  { id: "projectos", name: "Projectos", icon: FolderOpen, color: "text-fuchsia-600", bgColor: "bg-fuchsia-100" },
];

const demoContacts: Contact[] = [
  { id: "1", name: "Ana Silva", initials: "AS", lastMessage: "Vamos jantar hoje?", time: "14:32", unread: 2, online: true },
  { id: "2", name: "Marco Pereira", initials: "MP", lastMessage: "O projecto está quase...", time: "12:15", unread: 0, online: true },
  { id: "3", name: "Sofia Costa", initials: "SC", lastMessage: "Obrigada pelo feedback!", time: "ontem", unread: 0, online: false },
  { id: "4", name: "Rui Mendes", initials: "RM", lastMessage: "Precisamos de rever o plano", time: "ontem", unread: 1, online: false },
];

const demoMessages: Message[] = [
  { id: "1", text: "Olá! Como estás?", sender: "other", time: "14:20", channel: "pessoal" },
  { id: "2", text: "Estou bem, obrigada! E tu?", sender: "me", time: "14:21", channel: "pessoal" },
  { id: "3", text: "Tudo óptimo. Vamos jantar hoje?", sender: "other", time: "14:32", channel: "pessoal" },
];

// --- Components ---

function Sidebar({
  contacts,
  activeContact,
  onSelectContact,
  sidebarOpen,
  onCloseSidebar,
}: {
  contacts: Contact[];
  activeContact: string;
  onSelectContact: (id: string) => void;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
}) {
  return (
    <aside
      className={`${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-40 w-80 border-r border-stone-200 bg-white transition-transform md:relative md:translate-x-0`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linqo-600 text-sm font-bold text-white">
            L
          </div>
          <span className="text-lg font-bold text-stone-900">Linqo</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600">
            <Settings size={18} />
          </button>
          <button
            onClick={onCloseSidebar}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 md:hidden"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
          <Search size={16} className="text-stone-400" />
          <input
            type="text"
            placeholder="Procurar conversas..."
            className="flex-1 bg-transparent text-sm text-stone-900 placeholder-stone-400 outline-none"
          />
        </div>
      </div>

      {/* Contacts */}
      <div className="flex-1 overflow-y-auto">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => {
              onSelectContact(contact.id);
              onCloseSidebar();
            }}
            className={`flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-stone-50 ${
              activeContact === contact.id ? "bg-linqo-50 border-r-2 border-linqo-500" : ""
            }`}
          >
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-200 text-sm font-medium text-stone-600">
                {contact.initials}
              </div>
              {contact.online && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-linqo-500" />
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-900">{contact.name}</span>
                <span className="text-xs text-stone-400">{contact.time}</span>
              </div>
              <p className="truncate text-xs text-stone-500">{contact.lastMessage}</p>
            </div>
            {contact.unread > 0 && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-linqo-600 text-xs font-medium text-white">
                {contact.unread}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-stone-200 p-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linqo-100">
            <User size={16} className="text-linqo-600" />
          </div>
          <span className="flex-1 text-left font-medium">A minha conta</span>
          <LogOut size={16} className="text-stone-400" />
        </button>
      </div>
    </aside>
  );
}

function ChannelSelector({
  activeChannel,
  onSelect,
}: {
  activeChannel: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = channels.find((c) => c.id === activeChannel) || channels[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${active.bgColor} ${active.color}`}
      >
        <active.icon size={14} />
        {active.name}
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => {
                  onSelect(channel.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-stone-50 ${
                  activeChannel === channel.id ? "bg-stone-50 font-medium" : "text-stone-600"
                }`}
              >
                <channel.icon size={16} className={channel.color} />
                {channel.name}
              </button>
            ))}
            <div className="mx-3 my-1 border-t border-stone-100" />
            <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-stone-400 transition-colors hover:bg-stone-50 hover:text-stone-600">
              <Plus size={16} />
              Novo canal
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function EmotionalBadge({ analysis }: { analysis: EmotionalAnalysis }) {
  const colorMap = {
    positivo: "border-violet-200 bg-violet-50 text-violet-700",
    neutro: "border-stone-200 bg-stone-50 text-stone-600",
    negativo: "border-rose-200 bg-rose-50 text-rose-700",
    misto: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  };

  const tensionBar = (
    <div className="flex items-center gap-2">
      <span className="text-xs opacity-70">Tensão:</span>
      <div className="h-1.5 w-20 rounded-full bg-stone-200">
        <div
          className={`h-full rounded-full transition-all ${
            analysis.tension > 6
              ? "bg-rose-500"
              : analysis.tension > 3
                ? "bg-fuchsia-400"
                : "bg-violet-400"
          }`}
          style={{ width: `${analysis.tension * 10}%` }}
        />
      </div>
      <span className="text-xs font-medium">{analysis.tension}/10</span>
    </div>
  );

  return (
    <div className={`rounded-xl border p-3 ${colorMap[analysis.sentiment]} animate-fade-in`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Brain size={14} />
          <span className="text-xs font-semibold">Análise Linqo</span>
        </div>
        <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs">{analysis.intensity}</span>
      </div>

      <p className="mb-2 text-xs leading-relaxed">
        Tom: <strong>{analysis.tone}</strong>
      </p>

      {tensionBar}

      {analysis.suggestion && (
        <p className="mt-2 text-xs leading-relaxed opacity-80">
          <Sparkles size={10} className="mr-1 inline" />
          {analysis.suggestion}
        </p>
      )}

      {analysis.rewrite && (
        <div className="mt-2 rounded-lg bg-white/50 p-2">
          <p className="text-xs">
            <span className="font-medium">Sugestão:</span> &ldquo;{analysis.rewrite}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

function ChatMessages({
  messages,
  messagesEndRef,
}: {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${
              msg.sender === "me"
                ? "rounded-tr-sm bg-linqo-600 text-white"
                : "rounded-tl-sm bg-stone-100 text-stone-900"
            }`}
          >
            <p>{msg.text}</p>
            <p className={`mt-1 text-right text-xs ${msg.sender === "me" ? "text-white/60" : "text-stone-400"}`}>
              {msg.time}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

function MessageInput({
  onSend,
  analysis,
  aiEnabled,
  onToggleAi,
  analyzing,
}: {
  onSend: (text: string) => void;
  analysis: EmotionalAnalysis | null;
  aiEnabled: boolean;
  onToggleAi: () => void;
  analyzing: boolean;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [, setLocalAnalysis] = useState<EmotionalAnalysis | null>(null);

  const triggerAnalysis = useCallback(
    (value: string) => {
      if (!aiEnabled || value.trim().length < 5) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const result = await analyzeMessage(value);
        setLocalAnalysis(result);
      }, 600);
    },
    [aiEnabled]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    triggerAnalysis(e.target.value);
  };

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
      setLocalAnalysis(null);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-stone-200 bg-white p-4">
      {/* Analysis display */}
      {analysis && aiEnabled && <div className="mb-3">{<EmotionalBadge analysis={analysis} />}</div>}

      {analyzing && aiEnabled && (
        <div className="mb-3 flex items-center gap-2 text-xs text-stone-400 animate-pulse-gentle">
          <Brain size={14} />
          A analisar tom emocional...
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1 rounded-xl border border-stone-200 bg-stone-50 focus-within:border-linqo-500 focus-within:ring-2 focus-within:ring-linqo-500/10 transition-all">
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Escreve a tua mensagem..."
            rows={1}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <button
              onClick={onToggleAi}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-all ${
                aiEnabled
                  ? "bg-linqo-100 text-linqo-700"
                  : "bg-stone-100 text-stone-400"
              }`}
            >
              <div className={`h-1.5 w-1.5 rounded-full ${aiEnabled ? "bg-linqo-500 animate-pulse-gentle" : "bg-stone-300"}`} />
              IA {aiEnabled ? "activa" : "inactiva"}
            </button>
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-linqo-600 text-white transition-all hover:bg-linqo-700 disabled:opacity-30"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

// --- Main Chat Page ---

export default function ChatPage() {
  const [activeContact, setActiveContact] = useState("1");
  const [activeChannel, setActiveChannel] = useState("pessoal");
  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const [analysis, setAnalysis] = useState<EmotionalAnalysis | null>(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "me",
      time: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
      channel: activeChannel,
    };
    setMessages((prev) => [...prev, newMsg]);
    setAnalysis(null);
    setAnalyzing(false);
  };

  // Live analysis as user types (debounced)
  const handleInputChange = useCallback(
    (text: string) => {
      if (!aiEnabled || text.trim().length < 5) {
        setAnalysis(null);
        return;
      }
      setAnalyzing(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const result = await analyzeMessage(text);
        setAnalysis(result);
        setAnalyzing(false);
      }, 800);
    },
    [aiEnabled]
  );

  // Intercept input changes for analysis
  useEffect(() => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const handler = () => handleInputChange(textarea.value);
    textarea.addEventListener("input", handler);
    return () => textarea.removeEventListener("input", handler);
  }, [handleInputChange]);

  const contact = demoContacts.find((c) => c.id === activeContact);

  return (
    <div className="flex h-screen bg-stone-50">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        contacts={demoContacts}
        activeContact={activeContact}
        onSelectContact={setActiveContact}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <main className="flex flex-1 flex-col">
        {/* Chat header */}
        <header className="flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 md:hidden"
          >
            <MessageCircle size={20} />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-200 text-sm font-medium text-stone-600">
            {contact?.initials || "?"}
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-stone-900">{contact?.name || "Seleciona um contacto"}</h2>
            <div className="flex items-center gap-2">
              {contact?.online && (
                <span className="flex items-center gap-1 text-xs text-linqo-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-linqo-500" />
                  Online
                </span>
              )}
            </div>
          </div>

          <ChannelSelector activeChannel={activeChannel} onSelect={setActiveChannel} />
        </header>

        {/* Channel indicator */}
        <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 border-b border-stone-100">
          {(() => {
            const ch = channels.find((c) => c.id === activeChannel) || channels[0];
            return (
              <div className={`flex items-center gap-1.5 text-xs ${ch.color}`}>
                <ch.icon size={12} />
                <span>Canal: {ch.name}</span>
              </div>
            );
          })()}
          {aiEnabled && (
            <div className="ml-auto flex items-center gap-1 text-xs text-linqo-600">
              <Sparkles size={12} />
              <span>IA relacional activa</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />

        {/* Input */}
        <MessageInput
          onSend={handleSend}
          analysis={analysis}
          aiEnabled={aiEnabled}
          onToggleAi={() => setAiEnabled(!aiEnabled)}
          analyzing={analyzing}
        />
      </main>
    </div>
  );
}

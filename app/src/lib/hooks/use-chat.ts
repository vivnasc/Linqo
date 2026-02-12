"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// --- Types ---

export interface ChatContact {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  conversationId: string | null;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;
  channel: string;
  emotionalTone?: string | null;
  emotionalTension?: number | null;
  emotionalSentiment?: string | null;
}

interface DbMessage {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  channel_id: string | null;
  emotional_tone: string | null;
  emotional_tension: number | null;
  emotional_sentiment: string | null;
  created_at: string;
}

interface DbConversation {
  conversation_id: string;
}

interface DbContactRow {
  id: string;
  name: string;
  contact_user_id: string | null;
  status: string;
}

// --- Demo data (fallback when not authenticated) ---

export const demoContacts: ChatContact[] = [
  { id: "1", name: "Ana Silva", initials: "AS", lastMessage: "Vamos jantar hoje?", time: "14:32", unread: 2, online: true, conversationId: "demo-1" },
  { id: "2", name: "Marco Pereira", initials: "MP", lastMessage: "O projecto está quase...", time: "12:15", unread: 0, online: true, conversationId: "demo-2" },
  { id: "3", name: "Sofia Costa", initials: "SC", lastMessage: "Obrigada pelo feedback!", time: "ontem", unread: 0, online: false, conversationId: "demo-3" },
  { id: "4", name: "Rui Mendes", initials: "RM", lastMessage: "Precisamos de rever o plano", time: "ontem", unread: 1, online: false, conversationId: "demo-4" },
];

export const demoMessages: ChatMessage[] = [
  { id: "1", text: "Olá! Como estás?", sender: "other", time: "14:20", channel: "pessoal" },
  { id: "2", text: "Estou bem, obrigada! E tu?", sender: "me", time: "14:21", channel: "pessoal" },
  { id: "3", text: "Tudo óptimo. Vamos jantar hoje?", sender: "other", time: "14:32", channel: "pessoal" },
];

// --- Hook ---

export function useChat() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [contacts, setContacts] = useState<ChatContact[]>(demoContacts);
  const [messages, setMessages] = useState<ChatMessage[]>(demoMessages);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const realtimeRef = useRef<RealtimeChannel | null>(null);

  // Check auth
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        setAuthenticated(true);
      }
      setLoading(false);
    });
  }, [supabase]);

  // Load contacts from Supabase
  const loadContacts = useCallback(async () => {
    if (!userId || !supabase) return;

    const { data: contactRows } = await supabase
      .from("contacts")
      .select("id, name, contact_user_id, status")
      .eq("user_id", userId)
      .eq("status", "active") as { data: DbContactRow[] | null };

    if (!contactRows || contactRows.length === 0) return;

    // Get conversation IDs for each contact
    const mappedContacts: ChatContact[] = await Promise.all(
      contactRows.map(async (c) => {
        // Find conversation with this contact
        let conversationId: string | null = null;
        if (c.contact_user_id) {
          const { data: myConvs } = await supabase
            .from("conversation_participants")
            .select("conversation_id")
            .eq("user_id", userId) as { data: DbConversation[] | null };

          if (myConvs) {
            for (const conv of myConvs) {
              const { data: otherParticipant } = await supabase
                .from("conversation_participants")
                .select("conversation_id")
                .eq("conversation_id", conv.conversation_id)
                .eq("user_id", c.contact_user_id)
                .single() as { data: DbConversation | null };

              if (otherParticipant) {
                conversationId = conv.conversation_id;
                break;
              }
            }
          }
        }

        // Get last message
        let lastMessage = "";
        let time = "";
        let unread = 0;

        if (conversationId) {
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single() as { data: { content: string; created_at: string } | null };

          if (lastMsg) {
            lastMessage = lastMsg.content.length > 30
              ? lastMsg.content.slice(0, 30) + "..."
              : lastMsg.content;
            const date = new Date(lastMsg.created_at);
            const today = new Date();
            time = date.toDateString() === today.toDateString()
              ? date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
              : "ontem";
          }
        }

        const nameParts = c.name.split(" ");
        const initials = nameParts.map((n) => n[0]).join("").slice(0, 2).toUpperCase();

        return {
          id: c.id,
          name: c.name,
          initials,
          lastMessage,
          time,
          unread,
          online: false,
          conversationId,
        };
      })
    );

    setContacts(mappedContacts);
  }, [userId, supabase]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!userId || !supabase || conversationId.startsWith("demo-")) return;

    setActiveConversationId(conversationId);

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }) as { data: DbMessage[] | null };

    if (data) {
      setMessages(
        data.map((m) => ({
          id: m.id,
          text: m.content,
          sender: m.sender_id === userId ? ("me" as const) : ("other" as const),
          time: new Date(m.created_at).toLocaleTimeString("pt-PT", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          channel: m.channel_id || "pessoal",
          emotionalTone: m.emotional_tone,
          emotionalTension: m.emotional_tension,
          emotionalSentiment: m.emotional_sentiment,
        }))
      );
    }
  }, [userId, supabase]);

  // Subscribe to Realtime for active conversation
  useEffect(() => {
    if (!activeConversationId || !userId || !supabase || activeConversationId.startsWith("demo-")) return;

    // Clean up previous subscription
    if (realtimeRef.current) {
      supabase.removeChannel(realtimeRef.current);
    }

    const channel = supabase
      .channel(`messages:${activeConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          const m = payload.new as DbMessage;
          // Don't duplicate messages we sent ourselves
          if (m.sender_id === userId) return;

          const newMsg: ChatMessage = {
            id: m.id,
            text: m.content,
            sender: "other",
            time: new Date(m.created_at).toLocaleTimeString("pt-PT", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            channel: m.channel_id || "pessoal",
            emotionalTone: m.emotional_tone,
            emotionalTension: m.emotional_tension,
            emotionalSentiment: m.emotional_sentiment,
          };
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    realtimeRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, userId, supabase]);

  // Load contacts when authenticated
  useEffect(() => {
    if (authenticated) {
      loadContacts();
    }
  }, [authenticated, loadContacts]);

  // Send a message
  const sendMessage = useCallback(
    async (text: string, channelId?: string) => {
      const time = new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });

      if (!authenticated || !supabase || !activeConversationId || activeConversationId.startsWith("demo-")) {
        // Demo mode — just add locally
        const localMsg: ChatMessage = {
          id: Date.now().toString(),
          text,
          sender: "me",
          time,
          channel: channelId || "pessoal",
        };
        setMessages((prev) => [...prev, localMsg]);
        return;
      }

      // Real mode — insert into Supabase
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: activeConversationId,
          sender_id: userId,
          content: text,
          channel_id: channelId || null,
        })
        .select()
        .single() as { data: DbMessage | null; error: unknown };

      if (!error && data) {
        const newMsg: ChatMessage = {
          id: data.id,
          text: data.content,
          sender: "me",
          time: new Date(data.created_at).toLocaleTimeString("pt-PT", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          channel: data.channel_id || "pessoal",
        };
        setMessages((prev) => [...prev, newMsg]);

        // Update conversation timestamp
        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", activeConversationId);
      }
    },
    [authenticated, activeConversationId, userId, supabase]
  );

  // Logout
  const logout = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthenticated(false);
    setUserId(null);
    setContacts(demoContacts);
    setMessages(demoMessages);
  }, [supabase]);

  return {
    userId,
    authenticated,
    loading,
    contacts,
    messages,
    sendMessage,
    loadMessages,
    logout,
  };
}

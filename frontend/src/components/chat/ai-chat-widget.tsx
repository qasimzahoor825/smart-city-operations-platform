"use client";

import React from "react";
import { Bot, MessageSquareText, Send, Sparkles, X } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { aiApi, type ChatTurn } from "@/services/ai";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
}

const DEFAULT_SUGGESTIONS = [
  "How do I file a complaint?",
  "Show my pending bills",
  "Where can I find nearby hospitals?",
  "How is the air quality right now?",
];

export function AiChatWidget() {
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = React.useState<string[]>(DEFAULT_SUGGESTIONS);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isAuthenticated && messages.length === 0) {
      const firstName = user?.fullName?.split(" ")[0];
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Assalam-o-Alaikum${firstName ? `, ${firstName}` : ""}! I'm SmartCity Assist, your AI city assistant. I can help with complaints, bills, appointments, GIS maps, IoT alerts and emergencies. What would you like to do?`,
        },
      ]);
    }
  }, [isAuthenticated, user?.fullName]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  if (!isAuthenticated) return null;

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    const history: ChatTurn[] = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
    const botId = `bot-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: text },
      { id: botId, role: "assistant", content: "" },
    ]);
    setInput("");
    setBusy(true);
    try {
      let completed = false;
      try {
        await aiApi.chatStream(text, history, {
          onMeta: (meta) => {
            setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, intent: meta.intent } : m)));
            if (meta.suggestions?.length) setSuggestions(meta.suggestions.slice(0, 3));
          },
          onDelta: (chunk) => {
            setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, content: m.content + chunk } : m)));
          },
        });
        completed = true;
      } catch {
        // streaming unavailable → fall back to the plain endpoint
      }
      if (!completed) {
        const reply = await aiApi.chat(text, history);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? {
                  ...m,
                  content: reply?.reply ?? "Sorry, I couldn't reach the assistant right now. Please try again shortly.",
                  intent: m.intent ?? reply?.intent,
                }
              : m,
          ),
        );
        if (reply?.suggestions?.length) setSuggestions(reply.suggestions.slice(0, 3));
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? { ...m, content: "Something went wrong while getting a reply. Please try again in a moment." }
            : m,
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[3000] flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[30rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
          <div className="flex items-center justify-between bg-gradient-to-r from-teal-600 to-sky-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-black">
                  SmartCity Assist
                  <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                </p>
                <p className="text-[11px] text-teal-100">AI-powered city assistant</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-teal-100 hover:bg-white/15 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-4">
            {messages.map((message) =>
              message.role === "assistant" ? (
                <div key={message.id} className="flex items-end gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal-600 text-white">
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                  <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-[13px] leading-relaxed text-slate-700 shadow-sm">
                    {message.content}
                    {message.intent && (
                      <p className="mt-1 text-[9px] font-semibold tracking-wide text-teal-600 uppercase">
                        ⦿ live data · {message.intent.replace("_", " ")}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-r from-teal-600 to-sky-600 px-3 py-2 text-[13px] leading-relaxed text-white shadow-sm">
                    {message.content}
                  </div>
                </div>
              ),
            )}
            {busy && (
              <div className="flex items-end gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal-600 text-white">
                  <Bot className="h-3.5 w-3.5" />
                </span>
                <div className="rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-[13px] text-slate-400 shadow-sm">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {messages.length < 3 && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-white px-3 py-2.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void send(suggestion)}
                  className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[11px] font-semibold text-teal-700 transition hover:bg-teal-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex items-center gap-2 border-t border-slate-100 bg-white px-3 py-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about city services…"
              className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-md shadow-teal-600/30 transition hover:brightness-110 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-sky-600 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-teal-600/40 transition hover:brightness-110"
      >
        <MessageSquareText className="h-5 w-5" />
        {open ? "Close" : "Ask AI"}
      </button>
    </div>
  );
}
"use client";

import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

function renderMarkdown(text: string) {
  return text
    .split("\n")
    .map((line, i) => {
      const withInline = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline hover:opacity-80">$1</a>');

      if (line.startsWith("- ") || line.startsWith("• ")) {
        return `<li key=${i} class="ml-4 list-disc">${withInline}</li>`;
      }
      return `<p key=${i}>${withInline}</p>`;
    })
    .join("");
}

export function ChatWidget() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t("chat.welcome"),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: ChatMessage = { id: assistantId, role: "assistant", content: "", isStreaming: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = [...messages.filter((m) => m.id !== "welcome"), userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, language }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Maaf, terjadi gangguan. Silakan coba lagi.", isStreaming: false }
              : m,
          ),
        );
        setIsLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              accumulated += parsed.content;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m)),
              );
            }
          } catch {
            // skip
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)),
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Maaf, tidak dapat terhubung. Silakan coba lagi.", isStreaming: false }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div
          className={cn(
            "mb-4 w-[360px] max-w-[calc(100vw-3rem)]",
            "rounded-lg border border-[var(--border)] bg-[var(--card)]",
            "flex flex-col overflow-hidden",
            "animate-fade-in",
          )}
          style={{ height: "min(600px, calc(100vh - 8rem))" }}
          role="dialog"
          aria-label="Chat assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-sm text-[var(--accent-foreground)]">
                ✦
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{t("chat.title")}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{t("chat.subtitle")}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label={t("chat.close")}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                        : "bg-[var(--muted)] text-[var(--foreground)]",
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <div
                        className="[&_p]:mb-1 [&_p:last-child]:mb-0 [&_strong]:font-medium"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    ) : (
                      <p>{msg.content}</p>
                    )}
                    {msg.isStreaming && (
                      <span className="ml-0.5 inline-block h-3.5 w-1 animate-pulse bg-[var(--muted-foreground)] align-text-bottom" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="flex items-center gap-2 border-t border-[var(--border)] px-4 py-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? t("chat.sending") : t("chat.placeholder")}
              disabled={isLoading}
              className={cn(
                "h-9 flex-1 rounded-md border border-[var(--input)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]",
                "placeholder:text-[var(--muted-foreground)]",
                "focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-[-1px]",
                "disabled:opacity-50",
              )}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                "bg-[var(--accent)] text-[var(--accent-foreground)]",
                "transition-opacity duration-150",
                "disabled:opacity-40 disabled:pointer-events-none",
                "hover:opacity-90",
              )}
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2L9.5 14L7 9L2 6.5L14 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "ml-auto flex h-14 w-14 items-center justify-center rounded-full",
          "bg-[var(--accent)] text-[var(--accent-foreground)]",
          "transition-transform duration-200 ease-out",
          "hover:opacity-90 hover:scale-105",
          isOpen && "rotate-0",
        )}
        aria-label={isOpen ? t("chat.close") : t("chat.open")}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </div>
  );
}

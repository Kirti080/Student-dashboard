import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, Trash2, X } from "lucide-react";
import { sendChatMessage, type ChatMessage } from "@/services/chatServices";

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I’m your Student Portal assistant. How can I help with your studies today?",
};

export default function AIChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || loading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    const conversation = [...messages.filter((message) => message.id !== "welcome"), userMessage];

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const reply = await sendChatMessage(conversation);
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", content: reply },
      ]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "The assistant is unavailable right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([welcomeMessage]);
    setError("");
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] sm:bottom-6 sm:right-6">
      {open && (
        <section
          aria-label="AI student assistant"
          className="mb-3 flex h-[min(620px,calc(100vh-7rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl shadow-blue-950/20 sm:w-[390px] dark:border-slate-700 dark:bg-slate-900"
        >
          <header className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-black">Student AI Assistant</h2>
                <p className="flex items-center gap-1 text-xs text-blue-100">
                  <Sparkles className="h-3 w-3 text-yellow-300" /> Ready to help
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={clearChat} className="rounded-xl p-2 text-blue-100 transition hover:bg-white/15 hover:text-white" title="Clear conversation" aria-label="Clear conversation">
                <Trash2 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-blue-100 transition hover:bg-white/15 hover:text-white" title="Close assistant" aria-label="Close assistant">
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-slate-50 to-blue-50/50 p-4 dark:from-slate-900 dark:to-slate-950">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                  message.role === "user"
                    ? "rounded-br-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    : "rounded-bl-md border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}>
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <footer className="border-t border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            {error && <p className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400">{error}</p>}
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:ring-blue-900/40">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, 4000))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Ask about your studies…"
                className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">AI can make mistakes. Verify important academic information.</p>
          </footer>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/30 transition hover:-translate-y-0.5 hover:shadow-2xl active:scale-95"
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>
    </div>
  );
}

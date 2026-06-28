import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Settings2, Cpu } from "lucide-react";
import { useAppStore } from "../store";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";

export default function ChatInterface() {
  const {
    currentProject,
    currentConversation,
    setCurrentConversation,
    setConversations,
    messages,
    setMessages,
    addMessage,
    providers,
  } = useAppStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("gemini");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/providers")
      .then((res) => res.json())
      .then((data) => {
        useAppStore.getState().setProviders(data);
        if (data.length > 0) {
          setSelectedProvider(data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (currentProject) {
      fetch(`/api/projects/${currentProject.id}/conversations`)
        .then((res) => res.json())
        .then((data) => {
          setConversations(data);
          if (data.length > 0) {
            setCurrentConversation(data[0]);
          } else {
            setCurrentConversation(null);
            setMessages([]);
          }
        });
    }
  }, [currentProject]);

  useEffect(() => {
    if (currentConversation) {
      fetch(`/api/conversations/${currentConversation.id}/messages`)
        .then((res) => res.json())
        .then((data) => setMessages(data));
    }
  }, [currentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !currentProject) return;

    let convId = currentConversation?.id;
    if (!convId) {
      // Create new conversation
      const res = await fetch(
        `/api/projects/${currentProject.id}/conversations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: input.substring(0, 30) + "..." }),
        },
      );
      const data = await res.json();
      setCurrentConversation(data);
      convId = data.id;
    }

    const content = input;
    setInput("");
    addMessage({
      id: crypto.randomUUID(),
      conversation_id: convId!,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    });

    setLoading(true);
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, provider: selectedProvider }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate response");
      }

      addMessage({
        id: data.assistantMessageId,
        conversation_id: convId!,
        role: "assistant",
        content: data.result,
        provider: data.provider,
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error(err);
      addMessage({
        id: crypto.randomUUID(),
        conversation_id: convId!,
        role: "assistant",
        content: `**Error:** ${err.message}`,
        provider: "System",
        created_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[450px] shrink-0 border-l border-white/5 flex flex-col bg-[#0F0F0F]">
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6">
        <h3 className="font-medium flex items-center gap-2 text-sm text-gray-300">
          <Cpu className="w-4 h-4 text-indigo-400" />
          Orchestrator
        </h3>
        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          className="bg-black/40 border border-white/10 rounded-md text-xs px-2 py-1 outline-none focus:border-indigo-500 text-gray-300"
        >
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <Bot className="w-12 h-12 opacity-20" />
            <p className="text-sm text-center">
              Hello. I am the AI Director.
              <br />
              Describe what you want to build.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-white/5 border border-white/10 text-gray-400" : "bg-indigo-500/20 border border-indigo-500/40 text-indigo-400"}`}
            >
              {msg.role === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-[#141414] border border-white/5 text-gray-300 rounded-tl-sm"}`}
            >
              {msg.role === "assistant" && msg.provider && (
                <div className="text-[10px] font-mono text-gray-500 mb-2 uppercase flex items-center gap-1">
                  <Settings2 className="w-3 h-3" />
                  Provider: {msg.provider}
                </div>
              )}
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-300">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#141414] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#0F0F0F]">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Instruct the orchestrator..."
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-gray-300 resize-none outline-none focus:border-indigo-500 transition-colors h-[100px]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-500 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

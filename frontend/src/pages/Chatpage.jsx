import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Menu,
  Plus,
  Send,
  Paperclip,
  LogOut,
  MessageSquare,
  X,
  LoaderCircle,
} from "lucide-react";
import api from "../config/api";
import { useAuth } from "../context/AuthContext";
import Logo from "../componenets/Logo";

const suggestions = [
  "Make flashcards from my notes",
  "Quiz me on this material",
  "Explain a topic in simple terms",
];

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [material, setMaterial] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  //for loading the chat histories when a page opens
  useEffect(() => {
    api("/api/conversation/get")
      .then((data) => setChats(data.conversations || []))
      .catch(() => {});
  }, []);

  const addMessage = (role, content) => setMessages((m) => [...m, { role, content }]);

  const newChat = () => {
    setChatId(null);
    setMessages([]);
    setMaterial(null);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    logout();
    navigate("/");
  }

  const openChat = async (id) => {
    setSidebarOpen(false);
    try {
      const data = await api(`/api/chats/${id}`);
      setChatId(id);
      setMessages(data.messages || []);
    } catch (err) {
      addMessage("error", err.message);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    addMessage("user", text);
    setLoading(true);

    try {
      const data = await api("/api/message/send", {
        method: "POST",
        body: { message: text, chatId, materialId: material?.id },
      });
      addMessage("assistant", data.reply);

      if (!chatId && data.chatId) {
        setChatId(data.chatId);
        setChats((c) => [{ _id: data.chatId, title: text.slice(0, 40) }, ...c]);
      }
    } catch (err) {
      addMessage("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      const data = await api("/api/materials", { method: "POST", body: form });
      setMaterial({ id: data._id, name: file.name }); // adjust to your response shape
    } catch (err) {
      addMessage("error", err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex h-screen bg-black text-neutral-300">
      {sidebarOpen && (
        <div className="fixed inset-0 z-10 bg-black/70 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-neutral-900 bg-neutral-950 transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5">
          <Logo />
        </div>

        <div className="px-3">
          <button
            onClick={newChat}
            className="flex w-full items-center gap-3 rounded-xl border border-neutral-800 pl-15 py-3 text-sm text-white transition hover:border-neutral-600 hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Plus size={18} />
            <span>New chat</span>
          </button>
        </div>

        <nav aria-label="Chat history" className="mt-6 flex-1 overflow-y-auto px-3">
          <p className="px-3 pb-2 text-xs text-neutral-600">Recent</p>
          {chats.length === 0 && <p className="px-3 text-sm text-neutral-600">No chats yet</p>}
          {chats.map((c) => (
            <button
              key={c._id}
              onClick={() => openChat(c._id)}
              className={`flex w-full items-center gap-3 truncate rounded-lg px-3 py-3 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                c._id === chatId
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <MessageSquare size={16} className="shrink-0" />
              <span className="truncate">
                {c.title || "Untitled chat"}
              </span>
            </button>
          ))}
        </nav>

        <div className="flex items-center justify-between border-t border-neutral-900 p-5 text-sm">
          <span className="truncate text-neutral-300">{user?.username || "??"}</span>
          <button
            onClick={() => handleLogout()}
            title="Log out"
            aria-label="Log out"
            className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-sm text-neutral-400 hover:text-white"
          >
            <Menu size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl px-6 py-8">
            {messages.length === 0 ? (
              <div className="pt-[15vh]">
                <h1 className="text-4xl font-light tracking-tight text-white">What are we studying?</h1>
                <div className="mt-8 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setInput(s);
                        textareaRef.current?.focus();
                      }}
                      className="rounded-full border border-neutral-800 px-4 py-2 text-sm text-neutral-400 hover:border-neutral-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="space-y-8" aria-live="polite">
                {messages.map((m, i) => (
                  <li key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                    <p
                      className={`whitespace-pre-wrap leading-relaxed ${
                        m.role === "user"
                          ? "max-w-[85%] rounded-2xl bg-neutral-900 px-4 py-2.5 text-white"
                          : m.role === "error"
                          ? "text-red-400"
                          : "text-neutral-300"
                      }`}
                    >
                      {m.content}
                    </p>
                  </li>
                ))}
                {loading && (
                  <li className="flex items-center gap-3 text-sm text-neutral-500">
                    <LoaderCircle size={17} className="animate-spin" />
                    <span>Thinking...</span>
                  </li>
                )}
              </ul>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="mx-auto max-w-2xl">
            {(uploading || material) && (
              <p className="mb-2 text-sm text-neutral-500">
                {uploading ? "Uploading..." : `Using ${material.name}`}
                {material && (
                  <button
                    onClick={() => setMaterial(null)}
                    title="Remove attachment"
                    aria-label="Remove attachment"
                    className="ml-2 rounded-full p-1 text-neutral-500 hover:bg-neutral-800 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                )}
              </p>
            )}

            <div className="flex items-end gap-2 rounded-3xl border border-neutral-800 bg-neutral-950 p-2 focus-within:border-neutral-600">
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="sr-only" onChange={handleFile} />
              <button
                onClick={() => fileRef.current?.click()}
                title="Attach a document"
                aria-label="Attach a document"
                className="rounded-full p-3 text-neutral-400 transition hover:bg-neutral-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Paperclip size={20} />
              </button>
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                aria-label="Message"
                placeholder="Ask anything about your notes..."
                className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-white placeholder-neutral-600 focus:outline-none"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                title="Send message"
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
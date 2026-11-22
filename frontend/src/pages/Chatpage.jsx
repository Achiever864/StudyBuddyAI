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
  BookOpen,
  Lightbulb,
  HelpCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import api from "../config/api";
import { useAuth } from "../context/AuthContext";
import Logo from "../componenets/Logo";

const suggestions = [
  "Make flashcards from my notes",
  "Quiz me on this material",
  "Explain a topic in simple terms",
];

const modeLabels = {
  DIRECT: "Direct explanation",
  GUIDED: "Guided learning",
  SCAFFOLDED: "Step-by-step",
  COLLABORATIVE: "Collaborative learning",
  CHALLENGE: "Challenge mode",
};

const intentLabels = {
  CONCEPTUAL: "Concept explanation",
  PROBLEM_SOLVING: "Problem solving",
  ACADEMIC_WRITING: "Academic writing",
  ASSIGNMENT: "Assignment support",
  REVIEW: "Revision",
  PRACTICE: "Practice",
  GENERAL: "General",
};

const normalizeMessage = (message) => {
  return {
    ...message,
    content:
      message.content ||
      message.answer ||
      message.reply ||
      "",
    segments: Array.isArray(message.segments)
      ? message.segments
      : [],
    sources: Array.isArray(message.sources)
      ? message.sources
      : [],
  };
};

function ResponseSegment({ segment }) {
  const type = segment.type;
  const text = segment.text;

  if (!text) return null;

  const baseClasses = "whitespace-pre-wrap leading-relaxed";

  switch (type) {
    case "grounded":
      return (
        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 px-4 py-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-emerald-400">
            <BookOpen size={14} />
            <span>From your study material</span>
          </div>

          <p className={`${baseClasses} text-emerald-100/90`}>
            {text}
          </p>
        </div>
      );

    case "explanation":
      return (
        <p className={`${baseClasses} text-neutral-300`}>
          {text}
        </p>
      );

    case "hint":
      return (
        <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 px-4 py-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-amber-400">
            <Lightbulb size={14} />
            <span>Hint</span>
          </div>

          <p className={`${baseClasses} text-amber-100/90`}>
            {text}
          </p>
        </div>
      );

    case "example":
      return (
        <div className="rounded-xl border border-blue-900/50 bg-blue-950/20 px-4 py-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-blue-400">
            <Sparkles size={14} />
            <span>Example</span>
          </div>

          <p className={`${baseClasses} text-blue-100/90`}>
            {text}
          </p>
        </div>
      );

    case "question":
      return (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-neutral-400">
            <HelpCircle size={14} />
            <span>Think about this</span>
          </div>

          <p className={`${baseClasses} text-white`}>
            {text}
          </p>
        </div>
      );

    case "feedback":
      return (
        <div className="rounded-xl border border-violet-900/50 bg-violet-950/20 px-4 py-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-400">
            <CheckCircle2 size={14} />
            <span>Feedback</span>
          </div>

          <p className={`${baseClasses} text-violet-100/90`}>
            {text}
          </p>
        </div>
      );

    default:
      return (
        <p className={`${baseClasses} text-neutral-300`}>
          {text}
        </p>
      );
  }
}

function AssistantMessage({ message }) {
  const segments = Array.isArray(message.segments)
    ? message.segments
    : [];

  const hasStructuredSegments = segments.length > 0;

  const sources = Array.isArray(message.sources)
    ? message.sources
    : [];

  return (
    <div className="space-y-4">
      {/* Cognitive mode / intent metadata */}
      {(message.mode || message.intent) && (
        <div className="flex flex-wrap items-center gap-2">
          {message.mode && (
            <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-500">
              {modeLabels[message.mode] || message.mode}
            </span>
          )}

          {message.intent && (
            <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-600">
              {intentLabels[message.intent] || message.intent}
            </span>
          )}
        </div>
      )}

      {hasStructuredSegments ? (
        <div className="space-y-4">
          {segments.map((segment, index) => (
            <ResponseSegment
              key={segment.id || index}
              segment={segment}
            />
          ))}
        </div>
      ) : (
        <p className="whitespace-pre-wrap leading-relaxed text-neutral-300">
          {message.content || message.answer || message.reply}
        </p>
      )}
      {sources.length > 0 && (
        <div className="border-t border-neutral-900 pt-3">
          <div className="mb-2 flex items-center gap-2 text-xs text-neutral-600">
            <BookOpen size={13} />
            <span>Referenced material</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {sources.map((source, index) => (
              <span
                key={
                  source.chunkId ||
                  source.materialId ||
                  source.sourceIndex ||
                  index
                }
                className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs text-neutral-500"
              >
                Source {source.sourceIndex ?? index + 1}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");
  const [material, setMaterial] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);


  useEffect(() => {
    api("/api/conversation/get")
      .then((data) => {
        setChats(data.conversations || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) return;

    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    api("/api/auth/get")
      .then((data) => {
        login(data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [user, login, navigate]);

  const addMessage = (role, content, additionalData = {}) => {
    setMessages((previousMessages) => [
      ...previousMessages,
      {
        role,
        content,
        ...additionalData,
      },
    ]);
  };

  const newChat = () => {
    setChatId(null);
    setMessages([]);
    setMaterial(null);
    setSidebarOpen(false);

    textareaRef.current?.focus();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };


  const openChat = async (id) => {
    setSidebarOpen(false);

    try {
      const data = await api(`/api/conversation/getChats/${id}`);

      setChatId(id);

      setMessages(
        (data.messages || []).map(normalizeMessage)
      );

    } catch (err) {
      addMessage("error", err.message);
    }
  };

  const send = async () => {
    const text = input.trim();

    if (!text || loading) return;

    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    addMessage("user", text);

    setLoading(true);

    try {
      const data = await api("/api/message/send", {
        method: "POST",
        body: {
          message: text,
          chatId,
          materialId: material?.id,
        },
      });

      const assistantMessage = {
        role: "assistant",

        content:
          data.answer ||
          data.reply ||
          "",
        answer:
          data.answer ||
          data.reply ||
          "",
        segments: Array.isArray(data.segments)
          ? data.segments
          : [],
        mode: data.mode || null,
        intent: data.intent || null,
        sources: Array.isArray(data.sources)
          ? data.sources
          : [],
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ]);

      if (!chatId && data.chatId) {
        setChatId(data.chatId);

        setChats((previousChats) => [
          {
            _id: data.chatId,
            title: text.slice(0, 40),
          },
          ...previousChats,
        ]);
      }

    } catch (err) {
      addMessage("error", err.message || "Something went wrong.");
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
      const data = await api("/api/materials", {
        method: "POST",
        body: form,
      });

      setMaterial({
        id: data._id,
        name: file.name,
      });

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

    e.target.style.height = `${Math.min(
      e.target.scrollHeight,
      160
    )}px`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black text-neutral-300">

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/70 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-neutral-900 bg-neutral-950 transition-transform md:static md:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        <div className="p-5">
          <Logo />
        </div>

        <div className="px-3">
          <button
            onClick={newChat}
            className="flex w-full items-center gap-3 rounded-xl border border-neutral-800 px-4 py-3 text-sm text-white transition hover:border-neutral-600 hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Plus size={18} />

            <span>New chat</span>
          </button>
        </div>

        <nav
          aria-label="Chat history"
          className="mt-6 flex-1 overflow-y-auto px-3"
        >
          <p className="px-3 pb-2 text-xs text-neutral-600">
            Recent
          </p>

          {chats.length === 0 && (
            <p className="px-3 text-sm text-neutral-600">
              No chats yet
            </p>
          )}

          {chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => openChat(chat._id)}
              className={`flex w-full items-center gap-3 truncate rounded-lg px-3 py-3 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                chat._id === chatId
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <MessageSquare
                size={16}
                className="shrink-0"
              />

              <span className="truncate">
                {chat.title || "Untitled chat"}
              </span>
            </button>
          ))}
        </nav>

        <div className="flex items-center justify-between border-t border-neutral-900 p-5 text-sm">
          <span className="truncate text-neutral-300">
            {user?.username || "??"}
          </span>

          <button
            onClick={handleLogout}
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
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-6 py-8">

            {messages.length === 0 ? (
              <div className="pt-[15vh]">
                <h1 className="text-4xl font-light tracking-tight text-white">
                  What are we studying?
                </h1>

                <p className="mt-3 max-w-lg text-neutral-500">
                  Upload your study materials or ask a question.
                  I'll help you understand, practice, and learn.
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        textareaRef.current?.focus();
                      }}
                      className="rounded-full border border-neutral-800 px-4 py-2 text-sm text-neutral-400 transition hover:border-neutral-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (

              <ul
                className="space-y-8"
                aria-live="polite"
              >
                {messages.map((message, index) => (
                  <li
                    key={message._id || index}
                    className={
                      message.role === "user"
                        ? "flex justify-end"
                        : ""
                    }
                  >

                    {message.role === "user" && (
                      <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-neutral-900 px-4 py-2.5 leading-relaxed text-white">
                        {message.content}
                      </p>
                    )}

                    {message.role === "error" && (
                      <p className="whitespace-pre-wrap leading-relaxed text-red-400">
                        {message.content}
                      </p>
                    )}

                    {message.role === "assistant" && (
                      <div className="w-full max-w-full">
                        <AssistantMessage
                          message={normalizeMessage(message)}
                        />
                      </div>
                    )}

                  </li>
                ))}

                {loading && (
                  <li className="flex items-center gap-3 text-sm text-neutral-500">
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />

                    <span>Thinking...</span>
                  </li>
                )}
              </ul>
            )}

            <div ref={bottomRef} />

          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="mx-auto max-w-3xl">

            {(uploading || material) && (
              <p className="mb-2 flex items-center gap-2 text-sm text-neutral-500">

                {uploading
                  ? "Uploading..."
                  : `Using ${material.name}`}

                {material && (
                  <button
                    onClick={() => setMaterial(null)}
                    title="Remove attachment"
                    aria-label="Remove attachment"
                    className="rounded-full p-1 text-neutral-500 hover:bg-neutral-800 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                )}

              </p>
            )}

            <div className="flex items-end gap-2 rounded-3xl border border-neutral-800 bg-neutral-950 p-2 transition focus-within:border-neutral-600">

              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="sr-only"
                onChange={handleFile}
              />

              <button
                onClick={() => fileRef.current?.click()}
                title="Attach a document"
                aria-label="Attach a document"
                disabled={uploading}
                className="rounded-full p-3 text-neutral-400 transition hover:bg-neutral-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50"
              >
                {uploading ? (
                  <LoaderCircle
                    size={20}
                    className="animate-spin"
                  />
                ) : (
                  <Paperclip size={20} />
                )}
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

            <p className="mt-2 text-center text-xs text-neutral-700">
              StudyBuddyAI helps you learn. Always think critically about your answers.
            </p>

          </div>
        </div>

      </main>
    </div>
  );
}
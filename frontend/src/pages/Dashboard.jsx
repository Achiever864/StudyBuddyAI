import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  BookOpen,
  Layers,
  Brain,
  CalendarClock,
  ChartNoAxesColumnIncreasing,
  Users,
  Upload,
  Sparkles,
  Lightbulb,
  CalendarCheck,
} from "lucide-react";

import Logo from "../componenets/Logo.jsx";

const nav = [
  ["What we offer", "offer"],
  ["How it works", "how"],
  ["FAQ", "faq"],
  ["About", "about"],
];

const offers = [
  {
    name: "AI storage",
    icon: BookOpen,
    desc: "Keep every lecture note, PDF and past question in one place. Search it, ask it questions, and turn any of it into study material.",
  },
  {
    name: "Flashcards and quizzes",
    icon: Layers,
    desc: "Made from your own materials, then adjusted to the topics you keep forgetting.",
  },
  {
    name: "Explain it back",
    icon: Brain,
    desc: "Teach a concept to the AI. It asks follow-up questions until your understanding holds up.",
  },
  {
    name: "Smart revision",
    icon: CalendarClock,
    desc: "Spaced review and exam countdowns tell you what to study today, and for how long.",
  },
  {
    name: "Progress insights",
    icon: ChartNoAxesColumnIncreasing,
    desc: "See which topics are solid, which are slipping, and when you study best.",
  },
  {
    name: "Community",
    icon: Users,
    desc: "Study groups, shared decks and friendly challenges, so you never prepare alone.",
  },
];

const steps = [
  {
    title: "Add your materials",
    icon: Upload,
    desc: "Upload PDFs, documents or plain notes.",
  },
  {
    title: "Get study tools",
    icon: Sparkles,
    desc: "Flashcards, quizzes and concept maps are built from what you added.",
  },
  {
    title: "Think first",
    icon: Lightbulb,
    desc: "The AI asks you to recall and explain before it gives answers.",
  },
  {
    title: "Review on time",
    icon: CalendarCheck,
    desc: "Reviews are scheduled just before you would forget.",
  },
];

const faqs = [
  {
    q: "Will StudyBuddy do my assignments for me?",
    a: "No. It is built to make you work through ideas, then step in with hints and corrections. You keep the understanding, which is what exams test.",
  },
  {
    q: "What can I upload?",
    a: "PDFs, Word documents and plain text notes. More formats will follow.",
  },
  {
    q: "Who is it for?",
    a: "Any student who wants to learn deeply, and it is being built first with university students in mind.",
  },
];

const demos = {
  chatbot: {
    label: "A typical chatbot",
    q: "Why does Dijkstra's algorithm fail with negative edges?",
    a: "Because it assumes that once a node is finalised, no shorter path to it exists. A negative edge can break that. Here is the full explanation, a corrected version using Bellman-Ford, and code you can copy.",
    note: "Done in seconds. Not much of it stays with you.",
  },

  buddy: {
    label: "StudyBuddy",
    q: "Why does Dijkstra's algorithm fail with negative edges?",
    a: "Before I explain, what does Dijkstra assume at the moment it picks the closest unvisited node? Try one sentence. A hint is ready if you need it.",
    note: "A little harder now. Much more likely to stick.",
  },
};

const link =
  "text-neutral-400 transition hover:text-white focus:outline-none focus-visible:text-white focus-visible:underline underline-offset-4";

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-neutral-100 px-6 py-3 text-sm font-medium text-black transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black";

const ghostBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border border-neutral-700 px-6 py-3 text-sm text-white transition hover:border-neutral-400 hover:bg-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-white";

function useTyped(text, speed = 16) {
  const [n, setN] = useState(0);

  useEffect(() => {
    setN(0);
  }, [text]);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      setN(text.length);
      return;
    }

    if (n >= text.length) return;

    const timeout = setTimeout(() => {
      setN((current) => current + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [text, speed, n]);

  return text.slice(0, n);
}

function Demo() {
  const [tab, setTab] = useState("chatbot");

  const d = demos[tab];
  const typed = useTyped(d.a);
  const finished = typed.length === d.a.length;

  return (
    <div className="mt-16 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 sm:p-8">

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">
            Experience the difference
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Same question, two different approaches.
          </p>
        </div>

        <Sparkles size={18} className="text-neutral-500" />
      </div>


      <div
        className="mt-6 flex flex-wrap gap-2"
        role="group"
        aria-label="Compare AI responses"
      >
        {Object.entries(demos).map(([key, v]) => (
          <button
            key={key}
            type="button"
            aria-pressed={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-full border px-4 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              tab === key
                ? "border-neutral-100 bg-neutral-100 text-black"
                : "border-neutral-700 text-neutral-400 hover:border-neutral-400 hover:text-white"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="mt-8 min-h-52 space-y-6" aria-live="polite">
        <div className="flex justify-end">
          <p className="max-w-md rounded-2xl rounded-br-sm bg-neutral-800 px-4 py-3 text-sm leading-relaxed text-white">
            {d.q}
          </p>
        </div>

        <div className="max-w-xl">
          <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
            <Sparkles size={14} />
            {tab === "buddy" ? "StudyBuddy AI" : "Typical AI"}
          </div>

          <p className="leading-relaxed text-neutral-300">
            <span className="sr-only">{d.a}</span>

            <span aria-hidden="true">
              {typed}

              {!finished && (
                <span className="sb-blink ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-white" />
              )}
            </span>
          </p>
        </div>

        <p
          className={`flex items-center gap-2 text-sm text-neutral-500 transition-opacity duration-500 ${
            finished ? "opacity-100" : "opacity-0"
          }`}
        >
          <ArrowRight size={15} />
          {d.note}
        </p>
      </div>
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className="scroll-mt-24 border-t border-neutral-900 py-20 sm:py-24"
    >
      <h2
        id={`${id}-h`}
        className="sb-display text-3xl font-medium tracking-tight text-white sm:text-4xl"
      >
        {title}
      </h2>

      <div className="mt-10">
        {children}
      </div>
    </section>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-neutral-300">
      <style>{`@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700&display=swap");

        .sb-display {
          font-family: "Bricolage Grotesque", system-ui, sans-serif;
        }

        @keyframes sb-rise {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes sb-blink {
          50% {
            opacity: 0;
          }
        }

        .sb-rise {
          animation: sb-rise .7s cubic-bezier(.2,.7,.2,1) both;
        }

        .sb-blink {
          animation: sb-blink 1s steps(1) infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .sb-rise,
          .sb-blink {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-6 pb-16 pt-6 sm:pt-8">
        <header className="relative flex items-center justify-between gap-6">

          <Logo />

          <nav
            aria-label="Main navigation"
            className="hidden flex-1 justify-center gap-6 text-sm md:flex"
          >
            {nav.map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                className={link}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-sm sm:gap-5">

            <Link to="/login" className={link}>
              Log in
            </Link>

            <Link
              to="/login?mode=signup"
              className="hidden rounded-full border border-neutral-700 px-4 py-2 text-white transition hover:border-neutral-400 sm:block"
            >
              Sign up
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-900 hover:text-white md:hidden"
            >
              {menuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>

          {menuOpen && (
            <nav
              id="mobile-navigation"
              aria-label="Mobile navigation"
              className="absolute left-0 right-0 top-full z-30 mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 shadow-xl md:hidden"
            >
              {nav.map(([label, id]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-3 text-sm text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
                >
                  {label}
                </a>
              ))}

              <Link
                to="/login?mode=signup"
                onClick={() => setMenuOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-black"
              >
                Get started
                <ArrowRight size={16} />
              </Link>
            </nav>
          )}
        </header>

        <main>

          <section
            className="pb-24 pt-24 sm:pt-32"
            aria-labelledby="hero-h"
          >
            <h1
              id="hero-h"
              className="sb-display sb-rise max-w-3xl text-5xl font-medium leading-[1.05] tracking-tight text-white sm:text-7xl"
            >
              StudyBuddy, your all-in-one study AI.
            </h1>

            <p
              className="sb-rise mt-8 max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg"
              style={{ animationDelay: "150ms" }}
            >
              We are building an AI study assistant devoted entirely to
              learning and studying. It raises the mental effort you put
              in, so you stay sharp and keep your edge in a world where
              AI can do your homework for you.
            </p>

            <div
              className="sb-rise mt-10 flex flex-wrap gap-4"
              style={{ animationDelay: "300ms" }}
            >
              <Link
                to="/login?mode=signup"
                className={primaryBtn}
              >
                Get started
                <ArrowRight size={17} />
              </Link>

              <a href="#how" className={ghostBtn}>
                See how it works
                <ArrowRight size={16} />
              </a>
            </div>

            <div
              className="sb-rise"
              style={{ animationDelay: "450ms" }}
            >
              <Demo />
            </div>
          </section>

          <Section id="offer" title="What we offer">
            <ul className="grid gap-x-14 sm:grid-cols-2">
              {offers.map((o) => {
                const Icon = o.icon;

                return (
                  <li
                    key={o.name}
                    className="border-t border-neutral-900 py-7 first:border-t-0 sm:[&:nth-child(2)]:border-t-0"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-400">
                      <Icon size={20} strokeWidth={1.7} />
                    </div>

                    <h3 className="font-medium text-white">
                      {o.name}
                    </h3>

                    <p className="mt-2 leading-relaxed text-neutral-500">
                      {o.desc}
                    </p>
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section id="how" title="How it works">
            <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => {
                const Icon = s.icon;

                return (
                  <li key={s.title}>
                    <div className="mb-5 flex items-center justify-between">
                      <span className="sb-display text-3xl text-neutral-700">
                        0{i + 1}
                      </span>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-400">
                        <Icon size={19} />
                      </div>
                    </div>

                    <h3 className="font-medium text-white">
                      {s.title}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                      {s.desc}
                    </p>
                  </li>
                );
              })}
            </ol>

            <p className="mt-12 max-w-2xl leading-relaxed text-neutral-500">
              Every step is built on methods with strong evidence behind
              them: retrieval practice, spaced repetition,
              self-explanation and mixed practice.
            </p>
          </Section>

          <Section id="faq" title="Frequently asked questions">
            <div className="divide-y divide-neutral-900 border-y border-neutral-900">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group py-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                    <span>{f.q}</span>

                    <ChevronDown
                      size={19}
                      className="shrink-0 text-neutral-500 transition-transform duration-200 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>

                  <p className="mt-4 max-w-xl leading-relaxed text-neutral-500">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </Section>

          <Section id="about" title="Built by a student, for students">
            <p className="max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg">
              StudyBuddy is built by{" "}
              <span className="text-white">
                Igaga Ikhuemoisa Adeoluwa
              </span>
              , a 300-level Computer Science student who is constantly
              building EdTech solutions. The goal is simple: tools that
              make students think harder and learn faster, not tools
              that think for them.
            </p>
          </Section>

          <section
            className="border-t border-neutral-900 py-20 sm:py-24"
            aria-labelledby="cta-h"
          >
            <div className="max-w-2xl">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-300">
                <Sparkles size={21} />
              </div>

              <h2
                id="cta-h"
                className="sb-display max-w-xl text-4xl font-medium leading-tight tracking-tight text-white sm:text-5xl"
              >
                Ready to study in a way that lasts?
              </h2>

              <p className="mt-5 max-w-lg leading-relaxed text-neutral-500">
                Stop simply consuming information. Start understanding,
                practising and remembering it.
              </p>

              <Link
                to="/login?mode=signup"
                className={`${primaryBtn} mt-8`}
              >
                Create your account
                <ArrowRight size={17} />
              </Link>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="flex flex-col gap-6 border-t border-neutral-900 pt-8 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <span>
              StudyBuddy © {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Link to="/terms" className={link}>
              Terms
            </Link>

            <Link to="/privacy" className={link}>
              Privacy
            </Link>

            <span>
              Built by Igaga Ikhuemoisa Adeoluwa
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
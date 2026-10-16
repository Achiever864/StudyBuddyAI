import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const nav = [
  ["What we offer", "offer"],
  ["How it works", "how"],
  ["FAQ", "faq"],
  ["About", "about"],
];

const offers = [
  { name: "AI storage", desc: "Keep every lecture note, PDF and past question in one place. Search it, ask it questions, and turn any of it into study material." },
  { name: "Flashcards and quizzes", desc: "Made from your own materials, then adjusted to the topics you keep forgetting." },
  { name: "Explain it back", desc: "Teach a concept to the AI. It asks follow-up questions until your understanding holds up." },
  { name: "Smart revision", desc: "Spaced review and exam countdowns tell you what to study today, and for how long." },
  { name: "Progress insights", desc: "See which topics are solid, which are slipping, and when you study best." },
  { name: "Community", desc: "Study groups, shared decks and friendly challenges, so you never prepare alone." },
];

const steps = [
  { title: "Add your materials", desc: "Upload PDFs, documents or plain notes." },
  { title: "Get study tools", desc: "Flashcards, quizzes and concept maps are built from what you added." },
  { title: "Think first", desc: "The AI asks you to recall and explain before it gives answers." },
  { title: "Review on time", desc: "Reviews are scheduled just before you would forget." },
];

const faqs = [
  { q: "Will StudyBuddy do my assignments for me?", a: "No. It is built to make you work through ideas, then step in with hints and corrections. You keep the understanding, which is what exams test." },
  { q: "What can I upload?", a: "PDFs, Word documents and plain text notes. More formats will follow." },
  { q: "Who is it for?", a: "Any student who wants to learn deeply, and it is being built first with university students in mind." },
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
  "text-neutral-400 hover:text-white focus:outline-none focus-visible:text-white focus-visible:underline underline-offset-4";
const primaryBtn =
  "inline-block rounded-full bg-neutral-100 px-6 py-2.5 text-sm font-medium text-black hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black";
const ghostBtn =
  "inline-block rounded-full border border-neutral-700 px-6 py-2.5 text-sm text-white hover:border-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white";

function useTyped(text, speed = 16) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(text.length);
      return;
    }
    setN(0);
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return text.slice(0, n);
}

function Demo() {
  const [tab, setTab] = useState("chatbot");
  const d = demos[tab];
  const typed = useTyped(d.a);
  const finished = typed.length === d.a.length;

  return (
    <div className="mt-16 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8">
      <p className="text-sm text-neutral-500">Same question, two different AIs. Pick one.</p>
      <div role="tablist" aria-label="Compare AIs" className="mt-4 flex gap-2">
        {Object.entries(demos).map(([key, v]) => (
          <button
            key={key}
            role="tab"
            id={`tab-${key}`}
            aria-selected={tab === key}
            aria-controls="demo-panel"
            onClick={() => setTab(key)}
            className={`rounded-full border px-4 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              tab === key ? "border-neutral-100 bg-neutral-100 text-black" : "border-neutral-700 text-neutral-300 hover:border-neutral-400"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div id="demo-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-6 min-h-44 space-y-4">
        <p className="ml-auto w-fit max-w-md rounded-2xl rounded-br-sm bg-neutral-800 px-4 py-2.5 text-white">{d.q}</p>
        <div className="max-w-xl leading-relaxed text-neutral-300">
          <span className="sr-only">{d.a}</span>
          <span aria-hidden="true">
            {typed}
            {!finished && <span className="sb-blink ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-white" />}
          </span>
        </div>
        <p className={`text-sm text-neutral-500 transition-opacity duration-500 ${finished ? "opacity-100" : "opacity-0"}`}>{d.note}</p>
      </div>
    </div>
  );
}

function Section({ id, title, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-6 border-t border-neutral-900 py-20">
      <h2 id={`${id}-h`} className="sb-display text-3xl font-medium tracking-tight text-white">{title}</h2>
      <div className="mt-10">{children}</div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-neutral-300">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600&display=swap");
        .sb-display { font-family: "Bricolage Grotesque", system-ui, sans-serif; }
        @keyframes sb-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes sb-blink { 50% { opacity: 0; } }
        .sb-rise { animation: sb-rise .7s cubic-bezier(.2,.7,.2,1) both; }
        .sb-blink { animation: sb-blink 1s steps(1) infinite; }
        details[open] .sb-chev { transform: rotate(45deg); }
        @media (prefers-reduced-motion: reduce) { .sb-rise, .sb-blink { animation: none; } }
      `}</style>

      <div className="mx-auto max-w-5xl px-6 pb-16 pt-8">
        <header className="flex items-center justify-between gap-6">
          <span className="sb-display font-semibold text-white">StudyBuddy</span>
          <nav className="hidden flex-1 justify-center gap-6 text-sm md:flex" aria-label="Main">
            {nav.map(([label, id]) => (
              <a key={id} href={`#${id}`} className={link}>{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-5 text-sm">
            <Link to="/login" className={link}>Log in</Link>
            <Link to="/login" className="rounded-full border border-neutral-700 px-4 py-1.5 text-white hover:border-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              Sign up
            </Link>
          </div>
        </header>

        <main>
          <section className="pb-24 pt-24" aria-labelledby="hero-h">
            <h1
              id="hero-h"
              className="sb-display sb-rise max-w-3xl text-5xl font-medium leading-[1.05] tracking-tight text-white sm:text-7xl"
            >
              StudyBuddy, your all-in-one study AI.
            </h1>
            <p className="sb-rise mt-8 max-w-xl text-lg leading-relaxed text-neutral-400" style={{ animationDelay: "150ms" }}>
              We are building an AI model devoted entirely to learning and studying. It raises the mental effort you put in, so you stay sharp and keep your edge in a world where AI can do your homework for you.
            </p>
            <div className="sb-rise mt-10 flex flex-wrap gap-4" style={{ animationDelay: "300ms" }}>
              <Link to="/login" className={primaryBtn}>Get started</Link>
              <a href="#how" className={ghostBtn}>See how it works</a>
            </div>
            <div className="sb-rise" style={{ animationDelay: "450ms" }}>
              <Demo />
            </div>
          </section>

          <Section id="offer" title="What we offer">
            <ul className="grid gap-x-14 sm:grid-cols-2">
              {offers.map((o) => (
                <li key={o.name} className="border-t border-neutral-900 py-6 first:border-t-0 sm:[&:nth-child(2)]:border-t-0">
                  <h3 className="text-white">{o.name}</h3>
                  <p className="mt-1 leading-relaxed text-neutral-500">{o.desc}</p>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="how" title="How it works">
            <ol className="grid gap-10 sm:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <span className="sb-display text-3xl text-neutral-700">{i + 1}</span>
                  <h3 className="mt-2 text-white">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">{s.desc}</p>
                </li>
              ))}
            </ol>
            <p className="mt-12 max-w-2xl leading-relaxed text-neutral-500">
              Every step is built on methods with strong evidence behind them: retrieval practice, spaced repetition, self-explanation and mixed practice.
            </p>
          </Section>

          <Section id="faq" title="Questions">
            <div className="divide-y divide-neutral-900 border-y border-neutral-900">
              {faqs.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                    {f.q}
                    <span className="sb-chev text-xl text-neutral-500 transition-transform duration-200" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-3 max-w-xl leading-relaxed text-neutral-500">{f.a}</p>
                </details>
              ))}
            </div>
          </Section>

          <Section id="about" title="Built by a student, for students">
            <p className="max-w-xl text-lg leading-relaxed text-neutral-400">
              StudyBuddy is built by <span className="text-white">Igaga Ikhuemoisa Adeoluwa</span>, a 300-level Computer Science student who is constantly building EdTech solutions. The goal is simple: tools that make students think harder and learn faster, not tools that think for them.
            </p>
          </Section>

          <section className="border-t border-neutral-900 py-20" aria-labelledby="cta-h">
            <h2 id="cta-h" className="sb-display max-w-xl text-4xl font-medium leading-tight tracking-tight text-white">
              Ready to study in a way that lasts?
            </h2>
            <Link to="/login" className={`${primaryBtn} mt-8`}>Create your account</Link>
          </section>
        </main>

        <footer className="flex flex-wrap justify-between gap-4 border-t border-neutral-900 pt-8 text-sm text-neutral-600">
          <span>StudyBuddy {new Date().getFullYear()}</span>
          <span>Built by Igaga Ikhuemoisa Adeoluwa</span>
        </footer>
      </div>
    </div>
  );
}
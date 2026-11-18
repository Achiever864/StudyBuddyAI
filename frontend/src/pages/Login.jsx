import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import api from "../config/api.js";
import googleLogo from "../assets/google-logo.jpg";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../componenets/Logo.jsx";

const input =
  "w-full rounded-lg border border-neutral-800 bg-black px-4 py-3 text-sm text-white placeholder-neutral-600 transition focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500";

export default function LoginPage({ onAuth = () => {} }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const isSignup = mode === "signup";

  const set = (key) => (e) => 
    setForm((prev) => ({...prev, [key]: e.target.value }));

  const switchMode = (next) => {
    setMode(next);
    setError("");
  };

const handleGoogle = () => {
  window.location.href = `${import.meta.env.VITE_API_URL || ""}/api/auth/google`;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignup && !form.name.trim()) return setError("Enter your name to create an account.");
    if (!form.email.includes("@")) return setError("Enter a valid email address.");
    if (isSignup ? form.password.length < 8 : !form.password)
      return setError(isSignup ? "Use a password with at least 8 characters." : "Enter your password.");

    setLoading(true);
    try {
      const data = await api(`/api/auth/${isSignup ? "register" : "login"}`, {
        method: "POST",
        body: form,
      });

      localStorage.setItem("token", data.token);
      onAuth(data);

      login(data.user);
      navigate("/chat");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-neutral-300">
      <header className="px-6 py-6 md:px-10">
        <Logo />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm">
          <div role="tablist" aria-label="Account" className="mb-10 flex gap-6 border-b border-neutral-900 text-sm">
            {[
              ["login", "Log in"],
              ["signup", "Sign up"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => switchMode(value)}
                className={`-mb-px border-b pb-3 transition focus:outline-none focus-visible:text-white ${
                  mode === value
                    ? "border-white text-white"
                    : "border-transparent text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <h1 className="text-4xl font-light tracking-tight text-white">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-neutral-500">
            {isSignup ? "Turn your notes into flashcards and quizzes." : "Log in to pick up where you stopped."}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-neutral-800 px-6 py-3 text-sm font-medium text-white transition hover:border-neutral-600 hover:bg-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <img src={googleLogo} alt="" width="20" height="20" className="rounded-full object-contain" />
            Continue with Google
          </button>

          <div className="my-8 flex items-center gap-4 text-xs text-neutral-600">
            <span className="h-px flex-1 bg-neutral-900" />
            or continue with email
            <span className="h-px flex-1 bg-neutral-900" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {isSignup && (
              <div>
                <label htmlFor="name" className="mb-2 block text-sm text-neutral-400">Username</label>
                <input id="name" type="text" placeholder="Your name" className={input} value={form.name} onChange={set("name")} autoComplete="name" />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-neutral-400">Email</label>
              <input id="email" type="email" placeholder="you@example.com" className={input} value={form.email} onChange={set("email")} autoComplete="email" />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <label htmlFor="password" className="text-neutral-400">Password</label>
                {!isSignup && (
                  <a href="/forgot-password" className="text-neutral-500 underline-offset-4 transisiton hover:text-white hover:underline focus:outline-none focus-visible:text-white focus-visible:underline">
                    Forgot password?
                  </a>
                )}
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className={`${input} pr-12`}
                  value={form.password}
                  onChange={set("password")}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-500 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-sm text-red-400">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black transition hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cusrsor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {isSignup ? "Create accout" : "Log in"}
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {isSignup && (
            <p className="mt-6 text-center text-xs text-neutral-600">
              By creating an account you agree to our{" "}
              <a href="/terms" className="underline underline-offset-4 hover:text-neutral-300">Terms</a>{" "} and {" "}
              <a href="/privacy" className="underline underline-offset-4 hover:text-neutral-300">Privacy Policy</a>.
            </p>
          )}
        </div>
      </main>

      <footer className="px-6 py-5 text-center text-xs text-neutral-700">
          Study smarter. Learn better.
      </footer>
    </div>
  );
}
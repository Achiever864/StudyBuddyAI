import { useState } from "react";
import api from "../config/api.js";
import googleLogo from "../assets/google-logo.jpg";

const input =
  "w-full rounded-lg border border-neutral-800 bg-black px-3.5 py-3 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none";

export default function LoginPage({ onAuth = () => {} }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

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
      console.log(data); //testing our data
      localStorage.setItem("token", data.token);
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-neutral-300">
      <header className="px-6 py-8">
        <span className="font-medium text-white">StudyBuddy</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-24">
        <div className="w-full max-w-sm">
          <div role="tablist" aria-label="Account" className="mb-10 flex gap-6 border-b border-neutral-900 text-sm">
            {[
              ["login", "Log in"],
              ["signup", "Sign up"],
            ].map(([value, label]) => (
              <button
                key={value}
                role="tab"
                aria-selected={mode === value}
                onClick={() => switchMode(value)}
                className={`-mb-px border-b pb-3 focus:outline-none focus-visible:text-white ${
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
          <p className="mt-3 text-neutral-500">
            {isSignup ? "Turn your notes into flashcards and quizzes." : "Log in to pick up where you stopped."}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-neutral-700 px-6 py-3 text-sm font-medium text-white hover:border-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <img src={googleLogo} alt="" width="25" height="25" />
            Continue with Google
          </button>

          <div className="my-8 flex items-center gap-4 text-sm text-neutral-600">
            <span className="h-px flex-1 bg-neutral-900" />
            or use your email
            <span className="h-px flex-1 bg-neutral-900" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {isSignup && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm text-neutral-500">Name</label>
                <input id="name" className={input} value={form.name} onChange={set("name")} autoComplete="name" />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-neutral-500">Email</label>
              <input id="email" type="email" className={input} value={form.email} onChange={set("email")} autoComplete="email" />
            </div>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <label htmlFor="password" className="text-neutral-500">Password</label>
                {!isSignup && (
                  <a href="/forgot-password" className="text-neutral-500 underline-offset-4 hover:text-white hover:underline focus:outline-none focus-visible:text-white focus-visible:underline">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`${input} pr-16`}
                  value={form.password}
                  onChange={set("password")}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-neutral-500 hover:text-white focus:outline-none focus-visible:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-neutral-100 px-6 py-3 text-sm font-medium text-black hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-60"
            >
              {loading ? "Please wait..." : isSignup ? "Create account" : "Log in"}
            </button>
          </form>

          {isSignup && (
            <p className="mt-6 text-center text-xs text-neutral-600">
              By creating an account you agree to our{" "}
              <a href="/terms" className="underline underline-offset-4 hover:text-neutral-300">Terms</a> and{" "}
              <a href="/privacy" className="underline underline-offset-4 hover:text-neutral-300">Privacy Policy</a>.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
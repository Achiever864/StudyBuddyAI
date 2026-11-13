import { useState } from "react";
import api from "../config/api";

const input =
  "w-full rounded-lg border border-neutral-800 bg-black px-3.5 py-3 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none disabled:text-neutral-600 [color-scheme:dark]";
const primaryBtn =
  "rounded-full bg-neutral-100 px-6 py-2.5 text-sm font-medium text-black hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-60";
const outlineBtn =
  "rounded-full border border-neutral-700 px-6 py-2.5 text-sm font-medium text-white hover:border-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white";
const link =
  "text-sm text-neutral-400 hover:text-white focus:outline-none focus-visible:text-white focus-visible:underline underline-offset-4";

function Section({ title, children }) {
  return (
    <section aria-label={title} className="mt-12 border-t border-neutral-900 pt-10">
      <h2 className="mb-6 text-sm text-neutral-500">{title}</h2>
      {children}
    </section>
  );
}

function Field({ id, label, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-neutral-500">{label}</label>
      <input id={id} className={input} {...props} />
    </div>
  );
}

function Status({ s }) {
  if (!s) return null;
  return (
    <p role={s.error ? "alert" : "status"} className={`text-sm ${s.error ? "text-red-400" : "text-neutral-500"}`}>
      {s.text}
    </p>
  );
}

export default function SettingsPage({
  user = {},
  onBack = () => window.history.back(),
  onLogout = () => {},
  onUpdate = () => {},
}) {
  const [name, setName] = useState(user.name || "");
  const [prefs, setPrefs] = useState({
    dailyGoal: user.dailyGoal ?? 40,
    explainLevel: user.explainLevel ?? "standard",
  });
  const [pw, setPw] = useState({ current: "", next: "" });
  const [status, setStatus] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const setMsg = (key, text, error = false) => setStatus((s) => ({ ...s, [key]: { text, error } }));

  const run = async (key, fn) => {
    setMsg(key, "Saving...");
    try {
      await fn();
      setMsg(key, "Saved");
    } catch (err) {
      setMsg(key, err.message, true);
    }
  };

  const saveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) return setMsg("profile", "Enter your name.", true);
    run("profile", async () => onUpdate(await api("/api/users/me", { method: "PUT", body: { name } })));
  };

  const savePrefs = (e) => {
    e.preventDefault();
    run("prefs", async () =>
      onUpdate(
        await api("/api/users/me/preferences", {
          method: "PUT",
          body: { ...prefs, dailyGoal: Number(prefs.dailyGoal) },
        })
      )
    );
  };

  const savePassword = (e) => {
    e.preventDefault();
    if (pw.next.length < 8) return setMsg("password", "Use a new password with at least 8 characters.", true);
    run("password", async () => {
      await api("/api/users/me/password", { method: "PUT", body: pw });
      setPw({ current: "", next: "" });
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    onLogout();
  };

  const deleteAccount = async () => {
    try {
      await api("/api/users/me", { method: "DELETE" });
      logout();
    } catch (err) {
      setConfirmDelete(false);
      setMsg("delete", err.message, true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-300">
      <div className="mx-auto max-w-xl px-6 pb-24 pt-8">
        <header className="flex items-center justify-between">
          <span className="font-medium text-white">StudyBuddy</span>
          <button onClick={onBack} className={link}>Back to chat</button>
        </header>

        <h1 className="pt-20 text-4xl font-light tracking-tight text-white">Settings</h1>

        <Section title="Profile">
          <form onSubmit={saveProfile} className="space-y-4" noValidate>
            <Field id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <Field id="email" label="Email" value={user.email || ""} disabled readOnly />
            <div className="flex items-center gap-4">
              <button type="submit" className={primaryBtn}>Save</button>
              <Status s={status.profile} />
            </div>
          </form>
        </Section>

        <Section title="Study">
          <form onSubmit={savePrefs} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="goal" className="mb-1.5 block text-sm text-neutral-500">Daily goal</label>
                <select
                  id="goal"
                  className={input}
                  value={prefs.dailyGoal}
                  onChange={(e) => setPrefs({ ...prefs, dailyGoal: e.target.value })}
                >
                  {[20, 40, 60, 100].map((n) => (
                    <option key={n} value={n}>{n} cards a day</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="level" className="mb-1.5 block text-sm text-neutral-500">Explanation style</label>
                <select
                  id="level"
                  className={input}
                  value={prefs.explainLevel}
                  onChange={(e) => setPrefs({ ...prefs, explainLevel: e.target.value })}
                >
                  <option value="simple">Simple</option>
                  <option value="standard">Standard</option>
                  <option value="deep">Deep dive</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button type="submit" className={primaryBtn}>Save</button>
              <Status s={status.prefs} />
            </div>
          </form>
        </Section>

        <Section title="Password">
          <form onSubmit={savePassword} className="space-y-4" noValidate>
            <Field
              id="current"
              label="Current password"
              type="password"
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
              autoComplete="current-password"
            />
            <Field
              id="next"
              label="New password"
              type="password"
              value={pw.next}
              onChange={(e) => setPw({ ...pw, next: e.target.value })}
              autoComplete="new-password"
            />
            <div className="flex items-center gap-4">
              <button type="submit" className={primaryBtn}>Update password</button>
              <Status s={status.password} />
            </div>
          </form>
        </Section>

        <Section title="Account">
          <button onClick={logout} className={outlineBtn}>Log out</button>

          <div className="mt-10">
            {confirmDelete ? (
              <div>
                <p className="text-sm text-neutral-400">
                  This permanently deletes your account, materials and progress. You can't undo it.
                </p>
                <div className="mt-4 flex items-center gap-6">
                  <button
                    onClick={deleteAccount}
                    className="rounded-full border border-red-500/50 px-6 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    Yes, delete my account
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className={link}>Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-sm text-red-400 hover:text-red-300 focus:outline-none focus-visible:underline underline-offset-4"
              >
                Delete account
              </button>
            )}
            <div className="mt-3">
              <Status s={status.delete} />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
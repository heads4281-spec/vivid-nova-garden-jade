import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!authEnabled) return;
    setErr("");
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.split("@")[0] || "Sovereign",
          callbackURL: "/",
        });
        if (error) throw new Error(error.message ?? "Could not create the oath.");
      } else {
        const { error } = await authClient.signIn.email({
          email: email.trim(),
          password,
          callbackURL: "/",
        });
        if (error) throw new Error(error.message ?? "The gate refused that name.");
      }
      await nav({ to: "/" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "The gate is sealed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-bg px-5 py-10 text-fg">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url(/lore/title-wide.jpg)" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 20%, #2a0505 0%, #020008 62%, #000 100%)" }}
      />
      <div className="relative w-full max-w-sm space-y-4 rounded-md border border-border bg-surface/80 p-6 backdrop-blur-sm">
        <p className="font-display text-xs tracking-[0.35em] text-crimson">THE THRESHOLD</p>
        <h1 className="font-display text-3xl tracking-[0.08em] text-crimson">Sign the oath</h1>
        <p className="text-sm text-muted">Email and password, Google, or X. Progress binds to the name you keep.</p>

        {authEnabled ? (
          <>
            <div className="flex gap-2">
              {GROK_PROVIDERS.map((p) => (
                <button
                  key={p.providerId}
                  type="button"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                  className="flex-1 rounded-md border border-border bg-raised px-3 py-2.5 font-display text-xs tracking-widest text-fg hover:border-crimson"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-center font-display text-[0.65rem] tracking-[0.28em] text-subtle">OR BY BLOOD SCRIPT</p>
            {mode === "up" ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                autoComplete="name"
                className="h-11 w-full rounded-md border border-border bg-bg px-3 font-sans text-sm text-fg caret-crimson"
              />
            ) : null}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              autoComplete="email"
              className="h-11 w-full rounded-md border border-border bg-bg px-3 font-sans text-sm text-fg caret-crimson"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              autoComplete={mode === "up" ? "new-password" : "current-password"}
              className="h-11 w-full rounded-md border border-border bg-bg px-3 font-sans text-sm text-fg caret-crimson"
            />
            {err ? <p className="text-xs text-crimson">{err}</p> : null}
            <button
              type="button"
              disabled={busy || !email || password.length < 8}
              onClick={() => void submit()}
              className="w-full rounded-md border border-crimson bg-crimson/20 py-3 font-display text-sm tracking-[0.18em] text-fg hover:bg-crimson hover:text-bg disabled:opacity-40"
            >
              {busy ? "SEALING…" : mode === "up" ? "CREATE THE OATH" : "ENTER"}
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === "up" ? "in" : "up")}
              className="w-full font-display text-xs tracking-widest text-muted hover:text-fg"
            >
              {mode === "up" ? "Already sworn? Sign in" : "New blood? Create an account"}
            </button>
          </>
        ) : (
          <p className="text-sm text-muted">Sign-in is sealed in this cycle.</p>
        )}

        <Link
          to="/"
          className="block pt-2 text-center font-display text-xs tracking-[0.28em] text-subtle hover:text-crimson"
        >
          Continue as guest
        </Link>
      </div>
    </main>
  );
}

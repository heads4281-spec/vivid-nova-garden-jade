import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled } from "@/lib/auth/client";

const LINKS = [
  { to: "/", label: "Threshold" },
  { to: "/website", label: "Chronicle" },
  { to: "/weapons", label: "Armory" },
  { to: "/skills", label: "Rites" },
  { to: "/gallery", label: "Gallery" },
  { to: "/leaderboard", label: "Oathbound" },
  { to: "/download", label: "Bind" },
] as const;

export function SiteChrome({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  const { user, isPending } = useCurrentUserState();
  return (
    <div className="min-h-dvh bg-bg text-fg" style={{ touchAction: "pan-y" }}>
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-display text-sm tracking-[0.28em] text-crimson">
            CRIMSON SOVEREIGN
          </Link>
          <nav className="hidden flex-wrap items-center gap-4 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="font-display text-[0.65rem] tracking-[0.2em] text-muted hover:text-fg"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {authEnabled && !isPending && user ? (
              <div className="rounded-md border border-border bg-raised px-2 py-1">
                <UserButton />
              </div>
            ) : authEnabled ? (
              <Link
                to="/login"
                className="rounded-md border border-crimson px-3 py-1.5 font-display text-[0.65rem] tracking-[0.2em] text-fg hover:bg-crimson hover:text-bg"
              >
                Sign in
              </Link>
            ) : null}
          </div>
        </div>
        <nav className="flex gap-3 overflow-x-auto px-4 pb-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="shrink-0 font-display text-[0.65rem] tracking-[0.18em] text-muted hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="font-display text-xs tracking-[0.35em] text-crimson">{kicker}</p>
        <h1 className="mt-2 font-display text-4xl tracking-[0.08em] text-fg md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{lede}</p>
        <div className="mt-10">{children}</div>
      </main>
    </div>
  );
}

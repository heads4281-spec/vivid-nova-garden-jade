import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";

export const Route = createFileRoute("/download")({ component: Bind });

function Bind() {
  return (
    <SiteChrome
      kicker="BIND THE PALACE"
      title="Keep the Threshold on your glass"
      lede="Crimson Sovereign is a web palace. Install it to the home screen, pair DualSense, and return with code 63821."
    >
      <ol className="space-y-6">
        {[
          {
            n: "01",
            t: "Open the Threshold",
            d: "Enter the palace from this site. Desktop uses pointer lock. Mobile uses the left stick and FIRE / JUMP / SPRINT / HEAR.",
          },
          {
            n: "02",
            t: "Install as an app",
            d: "On iPhone: Share, then Add to Home Screen. On Android: the browser menu, then Install app. The palace opens full-screen, no chrome.",
          },
          {
            n: "03",
            t: "Sign the oath",
            d: "Email and password, Google, or X. Claimed Names, skills, and your cycle code bind to the account. Guests still walk the grounds.",
          },
          {
            n: "04",
            t: "Arms and DualSense",
            d: "Settings can pair DualSense. WASD, Space jump, Shift sprint, F to hear the knights. BAG and MAP stay on the HUD.",
          },
        ].map((s) => (
          <li key={s.n} className="rounded-md border border-border bg-surface p-5">
            <p className="font-display text-xs tracking-[0.3em] text-crimson">{s.n}</p>
            <h2 className="mt-1 font-display text-xl text-fg">{s.t}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
          </li>
        ))}
      </ol>
      <p className="mt-8 font-display text-sm tracking-[0.12em] text-fg">
        Cycle code <span className="text-crimson">63821</span> — The Threshold.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/"
          className="rounded-md border border-crimson bg-crimson/20 px-5 py-3 font-display text-xs tracking-[0.22em] text-fg hover:bg-crimson hover:text-bg"
        >
          Enter now
        </Link>
        <Link
          to="/login"
          className="rounded-md border border-border px-5 py-3 font-display text-xs tracking-[0.22em] text-muted hover:text-fg"
        >
          Sign in
        </Link>
      </div>
    </SiteChrome>
  );
}

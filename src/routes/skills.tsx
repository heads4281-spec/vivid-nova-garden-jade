import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { BRANCHES, SKILLS, skillStatLine } from "@/game/skills";

export const Route = createFileRoute("/skills")({ component: Rites });

function Rites() {
  return (
    <SiteChrome
      kicker="THE TREE"
      title="Rites of the Crimson Court"
      lede="Four branches: Strength, Magic, Attack, Minerals. Press Q in the palace to spend a rite. Ember Fortitude is yours from the first step."
    >
      {BRANCHES.map((b) => (
        <section key={b.id} className="mb-10">
          <h2 className="font-display text-xl tracking-[0.14em] text-crimson">{b.label}</h2>
          <p className="mt-1 text-sm text-muted">{b.line}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SKILLS.filter((s) => s.branch === b.id).map((s) => (
              <article key={s.id} className="overflow-hidden rounded-md border border-border bg-surface">
                <img src={s.art} alt="" className="h-28 w-full object-cover" />
                <div className="space-y-1 p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-sm text-fg">{s.name}</h3>
                    <span className="font-mono text-[0.65rem] text-subtle">T{s.tier}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted">{s.desc}</p>
                  <p className="font-mono text-[0.65rem] text-crimson/80">{skillStatLine(s)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
      <Link to="/" className="font-display text-xs tracking-[0.22em] text-crimson hover:text-fg">
        Return to the Threshold
      </Link>
    </SiteChrome>
  );
}

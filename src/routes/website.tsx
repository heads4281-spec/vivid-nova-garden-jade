import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { NAMES, CHARACTERS, TITLE_LEAD } from "@/game/story";

export const Route = createFileRoute("/website")({ component: Chronicle });

function Chronicle() {
  return (
    <SiteChrome
      kicker="TYPE VII · THE PALACE"
      title="Chronicle of the Six Names"
      lede={`${TITLE_LEAD[0]} ${TITLE_LEAD[1]} Walk the Threshold. Claim the Names. Come home.`}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {NAMES.map((n) => (
          <article key={n.id} className="overflow-hidden rounded-lg border border-border bg-surface">
            <img src={n.portrait} alt={n.title} className="h-44 w-full object-cover" />
            <div className="space-y-2 p-4">
              <p className="font-display text-xs tracking-[0.28em] text-crimson">{n.epithet}</p>
              <h2 className="font-display text-2xl text-fg">{n.title}</h2>
              <p className="text-sm leading-relaxed text-muted">{n.lore}</p>
            </div>
          </article>
        ))}
      </div>
      <section className="mt-12">
        <h2 className="font-display text-2xl tracking-[0.08em] text-fg">Hunters of the Threshold</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {CHARACTERS.map((c) => (
            <figure key={c.id} className="w-28 overflow-hidden rounded-md border border-border">
              <img src={c.portrait} alt={c.name} className="h-32 w-full object-cover" />
              <figcaption className="bg-raised px-2 py-1.5 text-center font-display text-[0.6rem] tracking-widest text-fg">
                {c.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          to="/"
          className="rounded-md border border-crimson bg-crimson/20 px-5 py-3 font-display text-xs tracking-[0.22em] text-fg hover:bg-crimson hover:text-bg"
        >
          Enter the palace
        </Link>
        <Link
          to="/login"
          className="rounded-md border border-border px-5 py-3 font-display text-xs tracking-[0.22em] text-muted hover:text-fg"
        >
          Sign the oath
        </Link>
      </div>
    </SiteChrome>
  );
}

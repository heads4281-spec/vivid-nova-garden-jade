import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { NAMES } from "@/game/story";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/leaderboard")({ component: Oathbound });

function Oathbound() {
  const { user } = useCurrentUserState();
  const hud = useGame((s) => s.hud);
  const cloud = useGame((s) => s.cloudSave);
  const runes = cloud?.runes?.length ?? hud.runes.length;
  const skills = cloud?.skills?.length ?? hud.skills.length;
  const code = cloud?.code ?? hud.code;

  return (
    <SiteChrome
      kicker="THE COURT"
      title="Oathbound of the Six Names"
      lede="Rank is not a mock list. The court is the Names themselves. Sign in to keep the Names you claim."
    >
      {user ? (
        <section className="mb-10 rounded-md border border-crimson/40 bg-raised p-5">
          <p className="font-display text-xs tracking-[0.28em] text-crimson">YOUR OATH</p>
          <h2 className="mt-1 font-display text-2xl text-fg">{user.displayName || "Sovereign"}</h2>
          <p className="mt-2 font-mono text-sm text-muted">
            Code {code} · {runes} Names · {skills} rites · {hud.kills} fallen
          </p>
        </section>
      ) : (
        <p className="mb-8 text-sm text-muted">
          <Link to="/login" className="text-crimson hover:text-fg">
            Sign the oath
          </Link>{" "}
          to bind claimed Names across devices.
        </p>
      )}
      <ol className="space-y-4">
        {NAMES.map((n, i) => (
          <li key={n.id} className="flex gap-4 overflow-hidden rounded-md border border-border bg-surface">
            <img src={n.portrait} alt="" className="h-28 w-24 shrink-0 object-cover" />
            <div className="py-3 pr-4">
              <p className="font-display text-xs tracking-[0.28em] text-subtle">SEAT {i + 1}</p>
              <h2 className="font-display text-xl text-fg">{n.title}</h2>
              <p className="text-sm text-muted">{n.epithet}</p>
              <p className="mt-1 text-xs leading-relaxed text-subtle">{n.zone}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link
        to="/"
        className="mt-8 inline-block rounded-md border border-crimson px-5 py-3 font-display text-xs tracking-[0.22em] text-fg hover:bg-crimson hover:text-bg"
      >
        Claim them in the palace
      </Link>
    </SiteChrome>
  );
}

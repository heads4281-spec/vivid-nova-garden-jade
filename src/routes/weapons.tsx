import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { CATS, WEAPONS, type WeaponDef } from "@/game/arsenal";

export const Route = createFileRoute("/weapons")({ component: Armory });

function fireLabel(w: WeaponDef) {
  if (w.fire === "melee") return w.automatic ? "flurry" : "cleave";
  if (w.fire === "hitscan" && w.automatic) return "auto";
  return w.fire;
}

function Armory() {
  return (
    <SiteChrome
      kicker="THE BAG"
      title="Armory of the Blood Crown"
      lede="Spark Rifle, arterial greatsword, ember hammer, law staff, blood scythe. Open BAG in the palace to equip. Recoil, heat, and recovery are live on every arm."
    >
      {CATS.map((cat) => {
        const list = WEAPONS.filter((w) => w.cat === cat.id);
        return (
          <section key={cat.id} className="mb-10">
            <h2 className="font-display text-xl tracking-[0.14em] text-crimson">{cat.label}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((w) => (
                <article key={w.id} className="flex gap-3 overflow-hidden rounded-md border border-border bg-surface p-3">
                  <img src={w.icon} alt="" className="h-20 w-16 shrink-0 rounded-sm object-cover" />
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-sm text-fg">{w.name}</h3>
                    <p className="font-display text-[0.6rem] tracking-widest text-subtle">{w.nameKey}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{w.desc}</p>
                    <p className="mt-1 font-mono text-[0.65rem] text-subtle">
                      {w.damage} dmg · {fireLabel(w)} · mag {w.mag}
                    </p>
                    <p className="font-mono text-[0.65rem] text-crimson/80">
                      recoil {w.recoil.toFixed(3)} · spread {w.spread.toFixed(3)} · rng {Math.round(w.range)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
      <Link to="/" className="font-display text-xs tracking-[0.22em] text-crimson hover:text-fg">
        Return to the Threshold
      </Link>
    </SiteChrome>
  );
}

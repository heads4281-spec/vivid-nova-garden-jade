import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";

export const Route = createFileRoute("/gallery")({ component: Gallery });

const SHOTS: { src: string; label: string }[] = [
  { src: "/lore/title-wide.jpg", label: "The Threshold" },
  { src: "/lore/palace-approach.jpg", label: "Palace approach" },
  { src: "/lore/palace-stairs.jpg", label: "Grand staircase" },
  { src: "/lore/throne-hall.jpg", label: "Throne hall" },
  { src: "/lore/vaelith-field.jpg", label: "Court of the First Flame" },
  { src: "/lore/rynara-basin.jpg", label: "Rune Archive" },
  { src: "/lore/sanguara-pool.jpg", label: "Blood canals" },
  { src: "/lore/nyxara-isles.jpg", label: "Night Ascendant" },
  { src: "/lore/knight.jpg", label: "Nave Knight" },
  { src: "/lore/sentinel.jpg", label: "Oathbound sentinel" },
  { src: "/lore/aelith.jpg", label: "Aelith the Crimson" },
  { src: "/lore/hunter-hood.jpg", label: "Hooded hunter" },
  { src: "/textures/floor.jpg", label: "Arterial floor" },
  { src: "/textures/wall.jpg", label: "Cracked wall" },
  { src: "/textures/column.jpg", label: "Gothic column" },
  { src: "/ui/world-map.jpg", label: "Open grounds" },
];

function Gallery() {
  return (
    <SiteChrome
      kicker="THE LOOK"
      title="Gallery of the Living Palace"
      lede="Black crystal, arterial cracks, blood moon, gothic filigree. These are the grounds you walk — not a loading smear."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SHOTS.map((s) => (
          <figure key={s.src} className="overflow-hidden rounded-md border border-border bg-surface">
            <img src={s.src} alt={s.label} className="h-44 w-full object-cover" />
            <figcaption className="px-3 py-2 font-display text-xs tracking-[0.16em] text-muted">{s.label}</figcaption>
          </figure>
        ))}
      </div>
      <Link to="/" className="mt-8 inline-block font-display text-xs tracking-[0.22em] text-crimson hover:text-fg">
        Walk them in first person
      </Link>
    </SiteChrome>
  );
}

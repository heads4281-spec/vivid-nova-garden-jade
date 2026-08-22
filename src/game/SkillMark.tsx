import { skillHash, type Branch } from "./skills";

const BRANCH_HUE: Record<Branch, string> = {
  strength: "currentColor",
  magic: "currentColor",
  attack: "currentColor",
  minerals: "currentColor",
};

export function SkillMark({
  id,
  branch,
  className,
}: {
  id: string;
  branch?: Branch;
  className?: string;
}) {
  const h = skillHash(id);
  const n = 5 + (h % 3);
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((h >>> (i * 3)) % 360) * (Math.PI / 180);
    const r = 5.4 + ((h >>> (i * 2)) % 5);
    pts.push(`${12 + Math.cos(a) * r},${12 + Math.sin(a) * r}`);
  }
  const inner = 2 + (h % 3);
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10.2" fill="none" stroke={BRANCH_HUE[branch ?? "strength"]} strokeWidth="1.15" />
      <polygon points={pts.join(" ")} fill="none" stroke="currentColor" strokeWidth="1.05" />
      <circle cx="12" cy="12" r={inner} fill="currentColor" />
      {(h & 1) === 1 ? <circle cx="12" cy="12" r="7.2" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.7" /> : null}
    </svg>
  );
}

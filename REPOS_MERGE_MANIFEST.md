# REPOS_MERGE_MANIFEST — heads4281-spec

**Canonical best repo:** [vivid-nova-garden-jade](https://github.com/heads4281-spec/vivid-nova-garden-jade)

Date: 2026-08-24

## Policy

- Merge *best* assets into `vivid-nova-garden-jade` only.
- Do not rewrite `src/game/engine.ts`, `palace-fx`, `combat-fx` best paths unless fixing a proven break.
- Textures / arms / lore already identical (same blob SHAs) across marble-delta and vivid.
- Sibling repos are Grok export clones of the same base; keep them as snapshots, do not duplicate binary textures into every fork.

## Repositories surveyed

| Repo | Role |
|------|------|
| vivid-nova-garden-jade | **CANONICAL** — full game, HTML5 hub, textures, lore, arms, recent extra maps |
| marble-delta-zinc-coral | Clean template twin (same textures SHA) |
| brave-rapid-topaz-drum | Export snapshot |
| earth-iris-olive-autumn | Export snapshot |
| lotus-craft-wind-garden | Export snapshot |
| river-kind-kind-raven | Export snapshot |
| olive-plum-forge-field | Export snapshot |
| pine-bold-dream-drum | Export snapshot |
| olive-falcon-apex-thunder | Export snapshot |
| ember-lark-ivory-vivid | Export snapshot |
| hazel-kite-cabin-autumn | Export snapshot |
| quartz-forest-able-pine | Export snapshot (+ LINKS.md) |
| arrow-arch-crisp-acre | Export snapshot |
| dune-cactus-ivory-cactus | Export snapshot |
| baker-beacon-king-plaza | Export snapshot |
| velvet-bamboo-spring-winter | Export snapshot |
| nova-sand-pine-timber | Export snapshot |
| fjord-dune-pepper-blue | Export snapshot |
| giant-clear-plaza-gem | Export snapshot |

## Assets confirmed present in canonical

### Textures (`public/textures/`)
- column.jpg, energy.jpg, floor.jpg, sky.jpg, wall.jpg, water.jpg

### Arms (`public/arms/`)
- ankh, arsenal-sheet, ember-hammer, needle, pulse, rail, rune-lance, rune, sovereign-axe, sovereign-sword, spark, war-scythe

### Lore (`public/lore/`)
- Aelith / Ankh Queen / boss / characters / constructs / Six Names / skills / throne / title art

### HTML5 (`public/html5/`)
- `index.html` — hub
- `holographic-atlas.html` — canvas atlas (JS)
- `extra-maps.html` — Kaelith / Vespera / Ankh Spire
- `auto-graphics-fix-game.html` — high-DPI platformer demo
- `map-worker.js` — Perlin/fBm chunk worker (holographic procedural)

### Engine (best files preserved)
- `src/game/engine.ts`, `GameApp.tsx`, `world.ts`, scripts QA helpers

## Python / holographic notes

Historical Python generators and worker notes live as root note-files in vivid (left untouched per prior policy). Production worker is now `public/html5/map-worker.js`.

## How to use

```bash
npm run dev
# HTML5 hub: http://localhost:8080/html5/
# Atlas:     /html5/holographic-atlas.html
# Worker:    new Worker('/html5/map-worker.js')
```

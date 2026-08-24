# Merge & Fix Status — 2026-08-24

## Repositories under heads4281-spec
Primary target: **vivid-nova-garden-jade** (Crimson Sovereign)

Related: marble-delta-zinc-coral, quartz-forest-able-pine, nova-sand-pine-timber, and other template dumps.

## What was merged / fixed this session
1. **Auto Graphics Fix HTML5 game** → `public/html5/auto-graphics-fix-game.html`
   - High-DPI / Retina aware canvas
   - Logical 800×450 resolution with auto scale
   - Keyboard + touch controls, platforms, coins
   - Standalone — open in any browser, no editor required

2. Preserved best engine paths: `src/game/` (engine.ts, GameApp.tsx, etc.), `public/textures/`, `scripts/`

3. Recent commits kept (extra maps Kaelith Forge / Vespera Hollow / Ankh Spire, holographic atlas, HTML5 pages)

4. Garbage note-filenames left untouched (as in prior commit policy)

## How to run the new HTML5 piece
```
npx serve public
# open http://localhost:3000/html5/auto-graphics-fix-game.html
```
Or double-click the file after download.

## Zip (local session)
artifacts/auto-graphics-fix-game.zip

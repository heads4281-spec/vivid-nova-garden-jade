import { useEffect, useRef, useState, type ReactNode, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Pause, Volume2, VolumeX, Github, Maximize2 } from "lucide-react";
import { padCode, loadSavedCode, cycleLink } from "./codes";
import { CONTROL_LEGEND, PAD_BLURB } from "./input-map";
import { NAMES, OPENING, WEAPONS, BRIEFING_BEATS, CODEX_SECTIONS, TITLE_LEAD, CHARACTERS, CATS } from "./story";
import { SKILLS, BRANCHES, TREE_ART, SHEET_ART, skillById, skillStatLine } from "./skills";
import { SkillMark } from "./SkillMark";
import { useGame } from "./store";
import type { CrimsonGame } from "./engine";
import { preloadArt } from "./assets";
import { drawSatNav, onMapArtReady } from "./map-art";
import { loadRun } from "./persist";
import { CloudSync, AuthSlot } from "./auth-ui";
import {
  drawHoloAtlas,
  EXTRA_MAPS,
  GITHUB_PROFILE,
  GITHUB_REPO,
  HOLO_ATLAS_HREF,
  EXTRA_MAPS_HREF,
  getWaypoint,
  lockWaypoint,
  pickHoloTarget,
  toggleFullscreen,
} from "./holo-map";

export function GameApp() {
  const screen = useGame((s) => s.screen);
  const runId = useGame((s) => s.runId);
  const playing =
    screen === "playing" ||
    screen === "paused" ||
    screen === "dead" ||
    screen === "victory" ||
    (runId > 0 && (screen === "codex" || screen === "settings"));
  useEffect(() => {
    try {
      const raw = localStorage.getItem("crimson-sovereign-settings-v3");
      if (raw) useGame.getState().patchSettings(JSON.parse(raw) as Partial<import("./store").Settings>);
    } catch {
      /* ignore */
    }
    if (window.matchMedia("(pointer: coarse)").matches) {
      useGame.getState().patchSettings({ gyro: false });
    }
    useGame.getState().setSeed(loadSavedCode());
    const save = loadRun();
    if (save) {
      useGame.getState().setCloudSave(save);
      const urlCode = new URLSearchParams(window.location.search).get("code");
      if (save.code && !urlCode) useGame.getState().loadCode(save.code);
      if (save.characterId) useGame.getState().setCharacter(save.characterId as import("./arsenal").CharacterId);
    }
    void preloadArt().catch(() => undefined);
  }, []);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg font-sans text-fg">
      <CloudSync />
      {playing ? <PlayView key={runId} /> : null}
      {screen === "title" ? <Title /> : null}
      {screen === "briefing" ? <Briefing /> : null}
      {screen === "codex" ? <Codex /> : null}
      {screen === "settings" ? <Settings /> : null}
      {screen === "paused" ? <PauseMenu /> : null}
      {screen === "dead" ? <End kind="dead" /> : null}
      {screen === "victory" ? <End kind="victory" /> : null}
    </div>
  );
}

function PlayView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<CrimsonGame | null>(null);
  const [ready, setReady] = useState(false);
  const screen = useGame((s) => s.screen);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dead = false;
    let game: CrimsonGame | null = null;
    void import("./engine").then(({ CrimsonGame }) => {
      if (dead || !canvas) return;
      game = new CrimsonGame(canvas);
      gameRef.current = game;
      void game
        .start()
        .catch((err) => {
          console.warn("start", err);
        })
        .finally(() => {
          if (!dead) setReady(true);
        });
    });
    const fail = window.setTimeout(() => {
      if (!dead) setReady(true);
    }, 280);
    return () => {
      dead = true;
      window.clearTimeout(fail);
      game?.dispose();
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    gameRef.current?.setPaused(screen !== "playing");
  }, [screen, ready]);

  useEffect(() => {
    const unsub = useGame.subscribe((s, p) => {
      if (s.settings.volume !== p.settings.volume || s.settings.muted !== p.settings.muted) {
        gameRef.current?.audio.setVolume(s.settings.volume);
        gameRef.current?.audio.setMuted(s.settings.muted);
      }
      if (s.settings.quality !== p.settings.quality) {
        gameRef.current?.setQuality(s.settings.quality);
      }
    });
    return unsub;
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full touch-none bg-raised" />
      {!ready ? (
        <div className="pointer-events-none absolute left-1/2 top-8 z-20 -translate-x-1/2 rounded-md border border-border bg-bg/50 px-4 py-2">
          <p className="font-display text-[0.65rem] tracking-[0.3em] text-muted">THRESHOLD LIVE</p>
        </div>
      ) : null}
      <Hud />
      <WeaponBag />
      <AtlasMap />
      <SkillTree />
      <MobileControls />
    </>
  );
}

function Hud() {
  const hud = useGame((s) => s.hud);
  const screen = useGame((s) => s.screen);
  const setScreen = useGame((s) => s.setScreen);
  if (screen !== "playing") return null;
  const hp = Math.max(0, hud.health / hud.maxHealth);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div
        className="absolute inset-0"
        style={{
          boxShadow: `inset 0 0 ${80 + hud.damageFlash * 120}px rgba(196,30,58,${0.12 + hud.damageFlash * 0.45})`,
        }}
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {hud.scoped ? null : (
          <>
            <div
              className="size-3 rounded-full border-[1.5px] border-crimson shadow-[0_0_12px_#c41e3a]"
              style={{ transform: `scale(${1 + (hud.recoilHeat ?? 0) * 0.35})`, opacity: 0.85 + (hud.recoilHeat ?? 0) * 0.15 }}
            />
            {([0, 90, 180, 270] as const).map((deg) => (
              <div
                key={deg}
                className="absolute left-1/2 top-1/2 h-2 w-px bg-crimson/80"
                style={{
                  transform: `translate(-50%,-50%) rotate(${deg}deg) translateY(${-10 - (hud.recoilHeat ?? 0) * 16}px)`,
                }}
              />
            ))}
            <div
              className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-fg/70"
              style={{ opacity: hud.hitmarker * 0.85, transform: `translate(-50%,-50%) rotate(45deg) scale(${1 + hud.hitmarker * 0.35})` }}
            />
          </>
        )}
      </div>
      {hud.scoped ? (
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, transparent 16%, rgba(6,0,2,0.55) 28%, rgba(0,0,0,0.92) 48%)",
            }}
          />
          <div className="absolute left-1/2 top-[18%] h-[64%] w-px -translate-x-1/2 bg-crimson/50" />
          <div className="absolute left-[18%] top-1/2 h-px w-[64%] -translate-y-1/2 bg-crimson/50" />
          <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-crimson/70" />
          <div className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-crimson" />
        </div>
      ) : null}
      {!hud.locked ? (
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-lg border border-border bg-bg/80 px-6 py-4 text-center">
            <p className="font-display text-sm tracking-[0.25em] text-fg">CLICK TO PLAY</p>
            <p className="mt-1 text-xs text-muted">WASD · S+Space backflip · V camera · I bag · M map · K tree · Q skill · 1–6 arms · F claim</p>
          </div>
        </div>
      ) : null}

      {hud.prompt ? (
        <div className="absolute left-1/2 top-[58%] flex -translate-x-1/2 items-center gap-2 rounded-md border border-border bg-bg/80 px-3 py-2">
          {hud.promptKey ? (
            <span className="grid min-w-8 place-items-center rounded-sm border border-crimson bg-raised px-2 py-0.5 font-display text-xs tracking-widest text-fg">
              {hud.promptKey}
            </span>
          ) : null}
          <p className="font-display text-xs tracking-wide text-fg">{hud.prompt}</p>
        </div>
      ) : null}

      <header className="absolute left-0 right-0 top-0 flex items-start justify-between gap-3 p-3 pt-[max(2.6rem,env(safe-area-inset-top))] font-display text-[0.7rem] tracking-[0.08em] [text-shadow:0_0_10px_#000] sm:p-4 sm:text-xs">
        <div className="max-w-[46vw] sm:max-w-xs">
          <p>Zone · {hud.zone}</p>
          {hud.checkpoint ? <p className="mt-1 tracking-[0.18em] text-ember">BOUND · {hud.checkpoint.toUpperCase()}</p> : null}
          <p className="mt-1 text-sm font-sans tracking-normal text-fg/85">{hud.objective}</p>
          <p className="mt-1 font-mono text-[0.65rem] tracking-widest text-subtle">CODE {hud.code}</p>
          <p className="mt-1 tracking-[0.18em] text-ember">
            VIEW · {hud.cam === "fps" ? "FIRST EYE" : hud.cam === "tps" ? "SHOULDER" : "SPECTATE"}
          </p>
          {hud.pad ? <p className="mt-1 tracking-[0.18em] text-ember">{hud.pad.toUpperCase()}</p> : null}
        </div>
        <div className="mr-28 flex items-start gap-2 sm:mr-64">
          <button
            type="button"
            className="pointer-events-auto grid size-11 place-items-center rounded-md border border-border bg-surface/80 text-fg"
            onClick={() => setScreen("paused")}
            aria-label="Pause"
          >
            <Pause className="size-4" />
          </button>
        </div>
      </header>

      {hud.event ? (
        <div className={`absolute left-1/2 w-[min(440px,88vw)] -translate-x-1/2 text-center ${hud.boss ? "top-24" : "top-[4.6rem]"}`}>
          <p className="font-display text-xs tracking-[0.32em] text-crimson">MOMENT {hud.event.id}</p>
          <p className="mt-1 font-display text-sm text-fg">{hud.event.name}</p>
          <p className="text-xs italic text-muted">{hud.event.desc}</p>
        </div>
      ) : null}

      {hud.boss ? (
        <div className="absolute left-1/2 top-16 w-[min(420px,86vw)] -translate-x-1/2">
          <p className="mb-1 text-center font-display text-xs tracking-[0.25em] text-ember">
            {hud.boss.name} · LV {hud.boss.level}
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-raised">
            <div className="h-full bg-crimson" style={{ width: `${(100 * hud.boss.hp) / hud.boss.max}%` }} />
          </div>
        </div>
      ) : null}

      {hud.moment ? (
        <div className="absolute left-1/2 top-[18%] w-[min(520px,92vw)] -translate-x-1/2 text-center">
          {hud.moment.portrait ? (
            <img
              src={hud.moment.portrait}
              alt={hud.moment.title}
              width={320}
              height={400}
              decoding="async"
              fetchPriority="high"
              className="mx-auto mb-4 h-44 w-32 rounded-md border border-crimson object-cover shadow-[0_0_40px_#c41e3a88] sm:h-56 sm:w-40"
            />
          ) : null}
          <p className="font-display text-xs tracking-[0.32em] text-crimson">{hud.moment.epithet.toUpperCase()}</p>
          <h2 className="mt-2 font-display text-2xl text-fg">{hud.moment.title}</h2>
          <p className="mt-3 text-sm italic leading-relaxed text-fg/90">{hud.moment.verse.join(" ")}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{hud.moment.body}</p>
        </div>
      ) : hud.skillCast ? (
        <div className="absolute left-1/2 top-[16%] w-[min(360px,82vw)] -translate-x-1/2 text-center">
          <img
            src={hud.skillCast.art}
            alt=""
            decoding="async"
            className="mx-auto h-36 w-24 rounded-md border border-crimson object-cover shadow-[0_0_48px_#c41e3a99] sm:h-44 sm:w-28"
          />
          <p className="mt-3 font-display text-xs tracking-[0.32em] text-ember">SKILL BOUND</p>
          <p className="mt-1 font-display text-lg text-fg">{hud.skillCast.name}</p>
        </div>
      ) : hud.message ? (
        <p className="absolute bottom-36 left-1/2 w-[min(520px,90vw)] -translate-x-1/2 text-center text-sm italic leading-relaxed text-fg [text-shadow:0_0_20px_#000] sm:bottom-24 sm:text-lg">
          {hud.message}
        </p>
      ) : null}

      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-3">
          <SkillSlot />
          <div className="w-44">
            <div className="mb-1 flex justify-between text-xs tracking-[0.2em] text-muted">
              <span>VITAL</span>
              <span className="tabular-nums text-fg">{Math.ceil(hud.health)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-raised">
              <div className="h-full bg-crimson" style={{ width: `${hp * 100}%` }} />
            </div>
            {hud.fortitude > 0 ? (
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-raised">
                <div className="h-full bg-ember" style={{ width: `${(hud.fortitude / 8) * 100}%` }} />
              </div>
            ) : null}
          </div>
        </div>
        <div className="absolute bottom-28 left-1/2 flex -translate-x-1/2 gap-2 pb-[env(safe-area-inset-bottom)] sm:bottom-5">
          {NAMES.map((n) => (
            <span
              key={n.id}
              className={`size-3.5 rounded-full border-[1.5px] border-crimson transition-all duration-[var(--motion-fast)] ${hud.runes.includes(n.id) ? "bg-crimson shadow-[0_0_18px_#c41e3a]" : "bg-transparent"}`}
              title={n.title}
            />
          ))}
        </div>
        <div className="hidden text-right lg:block">
          <img
            src={WEAPONS[hud.weaponId]?.icon}
            alt=""
            width={96}
            height={96}
            decoding="async"
            className="ml-auto mb-2 h-16 w-16 rounded-md border border-border object-cover"
          />
          <p className="font-display text-xs tracking-[0.2em] text-muted">{WEAPONS[hud.weaponId]?.nameKey}</p>
          <p className="font-display text-lg text-fg">{WEAPONS[hud.weaponId]?.name}</p>
          <p className="text-xs text-subtle">{hud.weapon.includes("·") ? hud.weapon.split("·")[1] : ""}</p>
          <p className="tabular-nums text-sm text-fg">
            <span className="text-xl">{hud.reloading ? "—" : hud.mag}</span>
            <span className="text-muted"> / {hud.ammo}</span>
          </p>
          {hud.charging > 0 ? (
            <div className="mt-1 ml-auto h-1 w-24 overflow-hidden rounded-full bg-raised">
              <div className="h-full bg-ember" style={{ width: `${hud.charging * 100}%` }} />
            </div>
          ) : null}
        </div>
      </div>
      {hud.scoped ? null : <PulseMap />}
    </div>
  );
}

function SkillSlot() {
  const activeId = useGame((s) => s.hud.activeSkill);
  const cd = useGame((s) => s.hud.skillCd);
  const forti = useGame((s) => s.hud.fortitude);
  const pts = useGame((s) => s.hud.skillPts);
  const skill = skillById(activeId) ?? SKILLS[0]!;
  const cooling = cd > 0.05;
  return (
    <button
      type="button"
      className={`pointer-events-auto relative h-[4.4rem] w-12 overflow-hidden rounded-md border sm:h-20 sm:w-14 ${
        forti > 0 ? "border-ember shadow-[0_0_18px_#c41e3a88]" : "border-crimson/70"
      }`}
      onClick={() => window.__crimsonInput?.skill?.()}
      aria-label={`${skill.name} · Q`}
    >
      <img src={skill.art} alt="" decoding="async" className="h-full w-full object-cover" />
      {cooling ? (
        <span className="absolute inset-0 grid place-items-center bg-bg/70 font-display text-sm tabular-nums text-fg">
          {Math.ceil(cd)}
        </span>
      ) : (
        <span className="absolute bottom-0 left-0 right-0 bg-bg/80 py-0.5 text-center font-display text-[0.55rem] tracking-widest text-ember">
          Q
        </span>
      )}
      {pts > 0 ? (
        <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-crimson font-display text-[0.55rem] text-fg">
          {pts}
        </span>
      ) : null}
    </button>
  );
}

function PulseMap() {
  const map = useGame((s) => s.hud.map);
  const scoped = useGame((s) => s.hud.scoped);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const paint = () => {
      const c = ref.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      drawSatNav(ctx, c.width, c.height, map, getWaypoint());
    };
    onMapArtReady(paint);
    paint();
  }, [map]);
  if (scoped) return null;
  return (
    <div className="absolute top-[4.6rem] right-2 z-10 size-[8.2rem] sm:top-3 sm:right-3 sm:size-[15.5rem]">
      <canvas
        ref={ref}
        width={512}
        height={512}
        className="absolute inset-[18%] h-[64%] w-[64%] rounded-full"
        aria-label="Pulse sat-nav"
      />
      <img src="/ui/pulse-frame.png" alt="" decoding="async" className="pointer-events-none absolute inset-0 h-full w-full object-contain" />
    </div>
  );
}

function WeaponBag() {
  const bag = useGame((s) => s.hud.bag);
  const weaponId = useGame((s) => s.hud.weaponId);
  const runes = useGame((s) => s.hud.runes);
  const mag = useGame((s) => s.hud.mag);
  const ammo = useGame((s) => s.hud.ammo);
  const [cat, setCat] = useState<(typeof CATS)[number]["id"]>("gun");
  if (!bag) return null;
  const pick = (id: number) => {
    window.__crimsonInput?.arm(id);
    window.__crimsonInput?.bag?.();
  };
  const list = WEAPONS.filter((w) => w.cat === cat);
  const equipped = WEAPONS[weaponId];
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-bg/80 p-3">
      <div className="relative w-[min(960px,96vw)] max-h-[92dvh] overflow-hidden rounded-md border border-border bg-surface">
        <img src="/ui/weapon-bag.png" alt="" decoding="async" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25" />
        <img src="/arms/arsenal-sheet.jpg" alt="" decoding="async" className="relative h-28 w-full object-cover object-top opacity-90" />
        <button
          type="button"
          className="absolute right-2 top-2 rounded-md border border-border bg-bg/80 px-3 py-1 font-display text-xs tracking-widest text-fg"
          onClick={() => window.__crimsonInput?.bag?.()}
        >
          Close · I / X
        </button>
        <p className="absolute left-3 top-3 font-display text-xs tracking-[0.3em] text-ember">ARSENAL OF THE BLOOD CROWN</p>
        {equipped ? (
          <p className="absolute left-3 top-10 font-display text-[0.7rem] tracking-widest text-fg">
            Equipped · {equipped.name} · mag {mag} · reserve {ammo}
          </p>
        ) : null}
        <div className="relative flex flex-wrap gap-1 p-2">
          {CATS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={`rounded-sm border px-3 py-1 font-display text-[0.65rem] tracking-widest ${
                cat === c.id ? "border-crimson bg-crimson/30 text-fg" : "border-border text-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="relative grid max-h-[55dvh] grid-cols-2 gap-2 overflow-y-auto p-3 sm:grid-cols-4">
          {list.map((w) => {
            const locked =
              (w.unlock === "eryndra" && !runes.includes("eryndra")) ||
              (w.unlock === "aelith" && !runes.includes("aelith"));
            const on = weaponId === w.id;
            return (
              <button
                key={w.id}
                type="button"
                disabled={locked}
                onClick={() => pick(w.id)}
                className={`rounded-md border p-1.5 text-left ${
                  on ? "border-crimson bg-crimson/30" : "border-border bg-bg/80"
                } ${locked ? "opacity-40" : ""}`}
              >
                <img src={w.icon} alt="" decoding="async" className="h-20 w-full rounded-sm object-cover" />
                <p className="mt-1 font-display text-[0.65rem] tracking-widest text-fg">{w.name}</p>
                <p className="text-[0.6rem] uppercase tracking-widest text-subtle">
                  {w.fire} · {w.damage} dmg · {locked ? "sealed" : on ? "in hand" : "ready"}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AtlasMap() {
  const atlas = useGame((s) => s.hud.atlas);
  const map = useGame((s) => s.hud.map);
  const ref = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [wp, setWp] = useState(getWaypoint());
  useEffect(() => {
    if (!atlas) return;
    let raf = 0;
    const loop = (t: number) => {
      const c = ref.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (ctx) drawHoloAtlas(ctx, c.width, c.height, map, t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [atlas, map]);
  if (!atlas || !map) return null;
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-bg/85 p-3">
      <div ref={wrapRef} className="holo-frame relative w-[min(920px,96vw)] overflow-hidden rounded-md border border-crimson/40 bg-raised">
        <canvas
          ref={ref}
          width={960}
          height={640}
          className="h-auto w-full cursor-crosshair"
          aria-label="Holographic atlas"
          onClick={(e) => {
            const c = ref.current;
            if (!c) return;
            const r = c.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width;
            const ny = (e.clientY - r.top) / r.height;
            setWp(pickHoloTarget(nx, ny));
          }}
        />
        <div className="absolute left-2 top-2 flex max-w-[70%] flex-wrap gap-1">
          {EXTRA_MAPS.map((m) => (
            <button
              key={m.id}
              type="button"
              className="holo-chip rounded-sm border bg-bg/80 px-2 py-1 font-display text-[0.55rem] tracking-widest text-ember"
              onClick={() => setWp(lockWaypoint(m.id))}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="absolute right-2 top-2 flex flex-wrap justify-end gap-1">
          <button
            type="button"
            className="rounded-md border border-border bg-bg/80 px-3 py-1 font-display text-xs tracking-widest text-fg"
            onClick={() => toggleFullscreen(wrapRef.current)}
          >
            Fullscreen
          </button>
          <a
            href={HOLO_ATLAS_HREF}
            className="rounded-md border border-border bg-bg/80 px-3 py-1 font-display text-xs tracking-widest text-holo"
          >
            HTML5 atlas
          </a>
          <button
            type="button"
            className="rounded-md border border-border bg-bg/80 px-3 py-1 font-display text-xs tracking-widest text-fg"
            onClick={() => window.__crimsonInput?.map?.()}
          >
            Close · M
          </button>
        </div>
        <p className="pointer-events-none absolute bottom-2 left-2 font-mono text-[0.65rem] tracking-widest text-holo">
          {wp ? `WAYPOINT · ${wp.label}` : "CLICK A COURT TO LOCK A WAYPOINT"}
        </p>
      </div>
    </div>
  );
}

function MobileControls() {
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const screen = useGame((s) => s.screen);
  const prompt = useGame((s) => s.hud.prompt);
  if (!coarse || screen !== "playing") return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <Stick />
      <div className="absolute bottom-6 right-2 flex flex-col items-end gap-1.5 pointer-events-auto pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <HoldBtn label="FIRE" big onHold={(v) => window.__crimsonInput?.fire(v)} />
        <div className="flex gap-2">
          <TapBtn label="JUMP" onTap={() => window.__crimsonInput?.jump()} />
          <HoldBtn label="SPRINT" onHold={(v) => window.__crimsonInput?.sprint(v)} />
        </div>
        <div className="flex gap-2">
          <TapBtn label="HEAR" hot={Boolean(prompt)} onTap={() => window.__crimsonInput?.interact()} />
          <TapBtn label="EMBER" hot={Boolean(prompt)} onTap={() => window.__crimsonInput?.skill?.()} />
          <TapBtn label="RELOAD" onTap={() => window.__crimsonInput?.reload()} />
        </div>
        <div className="flex gap-2">
          <TapBtn label="BAG" onTap={() => window.__crimsonInput?.bag?.()} />
          <TapBtn label="MAP" onTap={() => window.__crimsonInput?.map?.()} />
          <TapBtn label="VIEW" onTap={() => window.__crimsonInput?.camera?.()} />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((id) => (
            <TapBtn key={id} label={String(id + 1)} onTap={() => window.__crimsonInput?.arm(id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stick() {
  const ref = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const pid = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });

  const apply = (clientX: number, clientY: number) => {
    const max = 46;
    const dx = clientX - origin.current.x;
    const dy = clientY - origin.current.y;
    const len = Math.hypot(dx, dy);
    const s = len > max ? max / len : 1;
    const x = (dx * s) / max;
    const y = (-dy * s) / max;
    setKnob({ x: dx * s, y: dy * s });
    window.__crimsonInput?.move?.(x, y);
  };

  const down = (e: PointerEvent<HTMLDivElement>) => {
    pid.current = e.pointerId;
    origin.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    apply(e.clientX, e.clientY);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (pid.current !== e.pointerId) return;
    apply(e.clientX, e.clientY);
  };
  const up = (e: PointerEvent<HTMLDivElement>) => {
    if (pid.current !== e.pointerId) return;
    pid.current = null;
    setKnob({ x: 0, y: 0 });
    window.__crimsonInput?.move?.(0, 0);
  };

  return (
    <div
      ref={ref}
      className="pointer-events-auto absolute bottom-24 left-5 size-32 rounded-full border border-crimson/50 bg-surface/40"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      <div
        className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-crimson bg-crimson/70"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}

function HoldBtn({
  label,
  onHold,
  big,
}: {
  label: string;
  onHold: (v: boolean) => void;
  big?: boolean;
}) {
  return (
    <button
      type="button"
      className={`grid place-items-center rounded-full border border-crimson/60 bg-crimson/80 font-display tracking-widest text-fg ${
        big ? "size-16 text-xs" : "size-12 text-[10px]"
      }`}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onHold(true);
      }}
      onPointerUp={() => onHold(false)}
      onPointerCancel={() => onHold(false)}
      onLostPointerCapture={() => onHold(false)}
    >
      {label}
    </button>
  );
}

function TapBtn({
  label,
  onTap,
  hot,
}: {
  label: string;
  onTap: () => void;
  hot?: boolean;
}) {
  return (
    <button
      type="button"
      className={`grid min-w-11 place-items-center rounded-full border font-display text-[10px] tracking-widest ${
        hot ? "size-12 border-crimson bg-crimson/80 text-fg" : "size-11 border-border bg-surface/80 text-fg"
      }`}
      onPointerDown={(e) => {
        e.preventDefault();
        onTap();
      }}
    >
      {label}
    </button>
  );
}

function Title() {
  const startRun = useGame((s) => s.startRun);
  const setScreen = useGame((s) => s.setScreen);
  const openSettings = useGame((s) => s.openSettings);
  const openCodex = useGame((s) => s.openCodex);
  const seed = useGame((s) => s.seed);
  const profile = useGame((s) => s.profile);
  const rollSeed = useGame((s) => s.rollSeed);
  const loadCode = useGame((s) => s.loadCode);
  const [draft, setDraft] = useState(() => padCode(seed));
  const [codeErr, setCodeErr] = useState(false);
  const [fading, setFading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDraft(padCode(seed));
  }, [seed]);

  const enter = (to: "briefing" | "play") => {
    const ok = loadCode(draft);
    if (!ok) {
      setCodeErr(true);
      return;
    }
    setFading(true);
    if (to === "play") startRun();
    else setScreen("briefing");
  };

  return (
    <div
      className={`absolute inset-0 z-30 overflow-y-auto overscroll-y-contain transition-opacity duration-[1200ms] ${fading ? "pointer-events-none opacity-0" : "opacity-100"}`}
      style={{ touchAction: "pan-y" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35"
        style={{ backgroundImage: "url(/lore/title-wide.jpg)" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 30%, #2a0505 0%, #0a0000 52%, #000 100%)" }}
      />
      <div className="relative flex min-h-dvh flex-col items-center px-6 pb-16 pt-14 text-center">
        <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
          <AuthSlot />
        </div>
        <p className="font-display text-[0.85rem] tracking-[0.45em] text-crimson/80">TYPE VII · FULL COLOUR CYCLE</p>
        <h1
          className="mt-4 font-display text-[clamp(2.8rem,8vw,5.2rem)] leading-none tracking-[0.12em] text-crimson"
          style={{ textShadow: "0 0 60px #ff0033, 0 0 120px #ff0033" }}
        >
          CRIMSON SOVEREIGN
        </h1>
        <p className="mt-8 max-w-[540px] text-[1.05rem] leading-relaxed text-fg/90">
          {TITLE_LEAD[0]}
          <br />
          {TITLE_LEAD[1]}
          <br />
          <em>Come home.</em>
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Gate onClick={() => enter("briefing")}>ENTER THE PALACE</Gate>
          <Gate onClick={() => openCodex("title")}>FULL LORE CODEX</Gate>
          <Gate onClick={() => enter("briefing")}>THRESHOLD BRIEFING</Gate>
        </div>
        <p className="mt-10 font-display text-xs tracking-[0.08em] text-muted">
          Code
          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setCodeErr(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") enter("briefing");
            }}
            maxLength={5}
            inputMode="numeric"
            aria-label="Rune code"
            suppressHydrationWarning
            className="mx-2 h-9 w-[90px] border border-[#660000] bg-[#1a0505] text-center font-mono tracking-[0.2em] text-fg caret-crimson"
          />
          · 100 000 galactic myth cycles
        </p>
        <p className="mt-2 font-display text-xs tracking-[0.22em] text-crimson/70">
          {profile.glyphs} · SOVEREIGN LV {profile.bossLevel} · 10 000 OPEN-WORLD MOMENTS
        </p>
        <p className="mt-2 max-w-md text-sm text-subtle">{profile.blurb}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className="px-3 py-1 font-display text-xs tracking-[0.2em] text-muted hover:text-fg"
            onClick={() => rollSeed()}
          >
            New code
          </button>
          <button
            type="button"
            className="px-3 py-1 font-display text-xs tracking-[0.2em] text-muted hover:text-fg"
            onClick={() => {
              const link = cycleLink(seed);
              void navigator.clipboard?.writeText(link).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }).catch(() => {
                window.prompt("Copy this cycle code", link);
              });
            }}
          >
            {copied ? "Link copied" : "Share cycle"}
          </button>
          <button
            type="button"
            className="px-3 py-1 font-display text-xs tracking-[0.2em] text-muted hover:text-fg"
            onClick={() => openSettings("title")}
          >
            Settings
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 px-3 py-1 font-display text-xs tracking-[0.2em] text-muted hover:text-fg"
            onClick={() => toggleFullscreen()}
          >
            <Maximize2 className="size-3" />
            Fullscreen
          </button>
          <a
            href={GITHUB_PROFILE}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1 font-display text-xs tracking-[0.2em] text-muted hover:text-fg"
          >
            <Github className="size-3" />
            GitHub
          </a>
          <a
            href={HOLO_ATLAS_HREF}
            className="px-3 py-1 font-display text-xs tracking-[0.2em] text-holo hover:text-fg"
          >
            Holo atlas
          </a>
          <a
            href={EXTRA_MAPS_HREF}
            className="px-3 py-1 font-display text-xs tracking-[0.2em] text-ember hover:text-fg"
          >
            Extra maps
          </a>
        </div>
        <CharacterPick />
        <FeaturedSkills />
        {codeErr ? <p className="mt-2 text-xs text-crimson">Enter a code from 00000 to 99999.</p> : null}
      </div>
    </div>
  );
}

function CharacterPick() {
  const character = useGame((s) => s.settings.character);
  const setCharacter = useGame((s) => s.setCharacter);
  return (
    <div className="mt-6 flex max-w-xl flex-wrap justify-center gap-2">
      {CHARACTERS.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => setCharacter(c.id)}
          className={`w-16 overflow-hidden rounded-md border ${
            character === c.id ? "border-crimson shadow-[0_0_18px_#c41e3a]" : "border-border"
          }`}
        >
          <img src={c.portrait} alt={c.name} decoding="async" className="h-20 w-full object-cover" />
          <p className="bg-bg/80 px-0.5 py-0.5 font-display text-[0.55rem] tracking-widest text-fg">{c.name}</p>
        </button>
      ))}
    </div>
  );
}

function FeaturedSkills() {
  const ids = ["night-carapace", "tide-invocation", "precision-coil", "ankh-alloy"] as const;
  return (
    <div className="mt-5 mb-4 flex max-w-xl justify-center gap-2">
      {ids.map((id) => {
        const s = skillById(id);
        if (!s) return null;
        return (
          <div key={id} className="w-16 overflow-hidden rounded-md border border-border sm:w-[4.6rem]">
            <img src={s.art} alt={s.name} decoding="async" className="h-20 w-full object-cover sm:h-24" />
            <p className="truncate bg-bg/85 px-0.5 py-0.5 text-center font-display text-[0.5rem] tracking-widest text-muted">
              {s.branch}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function SkillTree() {
  const tree = useGame((s) => s.hud.tree);
  const pts = useGame((s) => s.hud.skillPts);
  const owned = useGame((s) => s.hud.skills);
  const active = useGame((s) => s.hud.activeSkill);
  const [branch, setBranch] = useState<(typeof BRANCHES)[number]["id"]>("strength");
  const [picked, setPicked] = useState(active || "ember-fortitude");
  if (!tree) return null;
  const list = SKILLS.filter((s) => s.branch === branch);
  const selected = skillById(picked) ?? list[0]!;
  const haveSel = owned.includes(selected.id);
  const lockedSel = !haveSel && selected.requires && !owned.includes(selected.requires);
  const canBuy = !haveSel && !lockedSel && pts >= selected.cost;
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-bg/85 p-3">
      <div className="relative w-[min(980px,96vw)] max-h-[92dvh] overflow-hidden rounded-lg border border-border bg-surface pointer-events-auto">
        <img src={TREE_ART} alt="" decoding="async" className="h-24 w-full object-cover object-center opacity-90 sm:h-32" />
        <img src={SHEET_ART} alt="" decoding="async" className="h-20 w-full object-cover object-top opacity-95 sm:h-28" />
        <p className="absolute left-3 top-3 font-display text-xs tracking-[0.35em] text-ember">
          FOUR BRANCHES · {pts} STONES
        </p>
        <button
          type="button"
          className="absolute right-2 top-2 rounded-md border border-border bg-bg/80 px-3 py-1 font-display text-xs tracking-widest text-fg"
          onClick={() => window.__crimsonInput?.tree?.()}
        >
          Close · K
        </button>
        <div className="flex flex-wrap gap-1 p-2">
          {BRANCHES.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setBranch(b.id);
                const first = SKILLS.find((s) => s.branch === b.id);
                if (first) setPicked(first.id);
              }}
              className={`rounded-sm border px-3 py-1 font-display text-[0.65rem] tracking-widest ${
                branch === b.id ? "border-crimson bg-crimson/30 text-fg" : "border-border text-muted"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <p className="px-3 pb-1 text-xs italic text-muted">{BRANCHES.find((b) => b.id === branch)?.line}</p>
        <div className="grid max-h-[58dvh] gap-3 overflow-y-auto p-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
          <div className="overflow-hidden rounded-md border border-crimson/40 bg-bg/80">
            <img src={selected.art} alt="" decoding="async" className="h-44 w-full object-cover object-top sm:h-56" />
            <div className="p-3">
              <div className="flex items-center gap-2">
                <SkillMark id={selected.id} branch={selected.branch} className="size-7 text-crimson" />
                <div>
                  <p className="font-display text-sm tracking-widest text-fg">{selected.name}</p>
                  <p className="text-[0.6rem] uppercase tracking-widest text-subtle">
                    T{selected.tier} · {skillStatLine(selected)}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{selected.desc}</p>
              <button
                type="button"
                disabled={!!lockedSel || (!haveSel && !canBuy)}
                onClick={() => {
                  if (haveSel && selected.active) window.__crimsonInput?.bindSkill?.(selected.id);
                  else window.__crimsonInput?.buySkill?.(selected.id);
                }}
                className="mt-3 w-full rounded-md border border-crimson bg-crimson/20 px-3 py-2 font-display text-xs tracking-widest text-fg disabled:opacity-40"
              >
                {haveSel
                  ? selected.active
                    ? active === selected.id
                      ? "Bound to Q"
                      : "Bind to Q"
                    : "Rooted"
                  : lockedSel
                    ? "A deeper Name is required"
                    : selected.cost
                      ? `Spend ${selected.cost} stone`
                      : "Swear the oath"}
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {([1, 2, 3, 4] as const).map((tier) => {
              const row = list.filter((s) => s.tier === tier);
              if (!row.length) return null;
              return (
                <div key={tier}>
                  <p className="mb-1 font-display text-[0.6rem] tracking-[0.28em] text-subtle">TIER {tier}</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {row.map((s) => {
                      const have = owned.includes(s.id);
                      const locked = !have && s.requires && !owned.includes(s.requires);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setPicked(s.id);
                            if (have && s.active) window.__crimsonInput?.bindSkill?.(s.id);
                          }}
                          className={`overflow-hidden rounded-md border text-left ${
                            picked === s.id ? "border-ember ring-1 ring-ember" : have ? "border-crimson" : "border-border"
                          } ${locked ? "opacity-40" : ""} ${active === s.id ? "bg-crimson/20" : "bg-bg/80"}`}
                        >
                          <div className="relative">
                            <img src={s.art} alt="" decoding="async" className="h-16 w-full object-cover" />
                            <SkillMark
                              id={s.id}
                              branch={s.branch}
                              className="absolute right-1 top-1 size-5 text-ember drop-shadow"
                            />
                          </div>
                          <p className="truncate px-1.5 pt-1 font-display text-[0.58rem] tracking-widest text-fg">{s.name}</p>
                          <p className="px-1.5 pb-1.5 text-[0.5rem] uppercase tracking-widest text-subtle">
                            {s.active ? "active" : "passive"} · {s.cost ? `${s.cost}` : "oath"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Briefing() {
  const startRun = useGame((s) => s.startRun);
  const setScreen = useGame((s) => s.setScreen);
  const profile = useGame((s) => s.profile);
  const [i, setI] = useState(0);
  const n = NAMES[i]!;
  return (
    <div className="absolute inset-0 z-30 overflow-y-auto" style={{ background: "radial-gradient(ellipse at 50% 30%, #2a0505 0%, #0a0000 55%, #000 100%)" }}>
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-5 py-12">
        <p className="text-center font-display text-xs tracking-[0.4em] text-crimson">THRESHOLD BRIEFING</p>
        <h2 className="mt-3 text-center font-display text-3xl tracking-[0.08em] text-crimson md:text-4xl">THE OPEN PALACE UNDER THE MILKY WAY</h2>
        <p className="mt-2 text-center font-mono text-xs tracking-widest text-subtle">CODE {profile.padded} · {profile.glyphs} · SOVEREIGN LV {profile.bossLevel}</p>
        <div className="mt-8 space-y-4 text-[1.02rem] leading-relaxed text-fg/90">
          {BRIEFING_BEATS.map((b) => (
            <p key={b.slice(0, 24)}>{b}</p>
          ))}
          <p className="italic text-muted">{OPENING[2]}</p>
        </div>
        <div className="mt-8 flex items-center justify-center gap-3">
          <img src={n.portrait} alt={n.title} decoding="async" className="h-28 w-20 rounded-md border border-border object-cover" />
          <div>
            <p className="font-display text-lg text-fg">{n.title}</p>
            <p className="text-xs tracking-[0.22em] text-crimson">{n.epithet.toUpperCase()}</p>
            <p className="mt-1 text-sm italic text-muted">{n.zone}</p>
            <div className="mt-2 flex gap-2">
              <Ghost aria="Previous name" onClick={() => setI((v) => (v + 5) % 6)}>
                <ChevronLeft className="size-4" />
              </Ghost>
              <Ghost aria="Next name" onClick={() => setI((v) => (v + 1) % 6)}>
                <ChevronRight className="size-4" />
              </Ghost>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <Primary onClick={() => startRun()}>Deploy</Primary>
          <Ghost onClick={() => setScreen("title")}>Return</Ghost>
        </div>
      </div>
    </div>
  );
}

function Codex() {
  const setScreen = useGame((s) => s.setScreen);
  const startRun = useGame((s) => s.startRun);
  const to = useGame((s) => s.settingsTo);
  const profile = useGame((s) => s.profile);
  const fromRun = to === "paused" || to === "playing";
  const [tab, setTab] = useState<"lore" | "arms" | "skills">("lore");
  const [branch, setBranch] = useState<(typeof BRANCHES)[number]["id"]>("strength");
  return (
    <div className="absolute inset-0 z-30 overflow-y-auto overscroll-y-contain" style={{ background: "radial-gradient(ellipse at 50% 20%, #2a0505 0%, #0a0000 60%, #000 100%)", touchAction: "pan-y" }}>
      <div className="mx-auto max-w-3xl px-5 py-10 md:px-10">
        <p className="font-display text-xs tracking-[0.3em] text-crimson">EXPANDED LORE CODEX</p>
        <h2 className="mt-2 font-display text-3xl text-fg">Codex of the Crimson Sovereign</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Code {profile.padded} · {profile.glyphs} · 100 000 myth cycles. Words only ever touch the outer edges.
        </p>
        <div className="mt-5 flex gap-1">
          {(
            [
              ["lore", "Names"],
              ["arms", "Arms"],
              ["skills", "Four Branches"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-sm border px-3 py-1.5 font-display text-[0.65rem] tracking-widest ${
                tab === id ? "border-crimson bg-crimson/25 text-fg" : "border-border text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "lore" ? (
          <>
            <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
              {NAMES.map((n) => (
                <img key={n.id} src={n.portrait} alt={n.title} title={n.title} decoding="async" className="h-24 w-16 shrink-0 rounded-sm border border-border object-cover" />
              ))}
            </div>
            <div className="mt-8 space-y-8">
              {CODEX_SECTIONS.map((s) => (
                <section key={s.heading}>
                  <h3 className="font-display text-xl text-crimson">{s.heading}</h3>
                  {s.body.map((p) => (
                    <p key={p.slice(0, 32)} className="mt-3 text-[1.02rem] leading-relaxed text-fg/90">
                      {p}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </>
        ) : null}
        {tab === "arms" ? (
          <div className="mt-8">
            <p className="font-display text-xs tracking-[0.3em] text-muted">ARMS OF THE CYCLE</p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {WEAPONS.map((w) => (
                <li key={w.id} className="rounded-md border border-border bg-raised p-4">
                  <img src={w.icon} alt={w.name} decoding="async" className="mb-3 h-28 w-full rounded-sm object-cover" />
                  <p className="font-display text-fg">{w.name}</p>
                  <p className="text-xs text-crimson">{w.nameKey}</p>
                  <p className="mt-1 text-sm text-muted">{w.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {tab === "skills" ? (
          <div className="mt-6">
            <img src={TREE_ART} alt="Four branches of the Crimson Sovereign" decoding="async" className="mt-5 h-36 w-full rounded-md border border-crimson/40 object-cover object-center sm:h-48" />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Thirty-five roots under four crowns. Strength plates the blood. Magic rewrites the magazine. Attack writes a Name on the target. Minerals beat life-metal on the sky anvil. Spend Sovereign Stones. Bind an active to Q.
            </p>
            <div className="mt-4 flex flex-wrap gap-1">
              {BRANCHES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBranch(b.id)}
                  className={`rounded-sm border px-3 py-1 font-display text-[0.65rem] tracking-widest ${
                    branch === b.id ? "border-crimson bg-crimson/30 text-fg" : "border-border text-muted"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs italic text-muted">{BRANCHES.find((b) => b.id === branch)?.line}</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {SKILLS.filter((s) => s.branch === branch).map((s) => (
                <li key={s.id} className="overflow-hidden rounded-md border border-border bg-raised">
                  <img src={s.art} alt={s.name} decoding="async" className="h-32 w-full object-cover object-top" />
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <SkillMark id={s.id} branch={s.branch} className="size-6 shrink-0 text-crimson" />
                      <div>
                        <p className="font-display text-sm text-fg">{s.name}</p>
                        <p className="text-[0.6rem] uppercase tracking-widest text-subtle">
                          T{s.tier} · {skillStatLine(s)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-snug text-muted">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          {fromRun ? null : <Primary onClick={() => startRun()}>Deploy</Primary>}
          <Ghost onClick={() => setScreen(fromRun ? "paused" : to === "title" ? "title" : "title")}>
            {fromRun ? "Resume" : "Close Codex"}
          </Ghost>
        </div>
      </div>
    </div>
  );
}

function Settings() {
  const settings = useGame((s) => s.settings);
  const patch = useGame((s) => s.patchSettings);
  const to = useGame((s) => s.settingsTo);
  const setScreen = useGame((s) => s.setScreen);
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-bg/90 p-5">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6">
        <h2 className="font-display text-2xl text-fg">Settings</h2>
        <label className="mt-6 block text-xs tracking-[0.2em] text-muted">LOOK SENSITIVITY</label>
        <input
          type="range"
          min={0.0008}
          max={0.005}
          step={0.0001}
          value={settings.sensitivity}
          onChange={(e) => patch({ sensitivity: Number(e.target.value) })}
          className="mt-2 w-full accent-crimson"
        />
        <label className="mt-5 flex items-center justify-between text-sm text-fg">
          Invert Y
          <input type="checkbox" checked={settings.invertY} onChange={(e) => patch({ invertY: e.target.checked })} />
        </label>
        <label className="mt-3 flex items-center justify-between text-sm text-fg">
          Screen shake
          <input type="checkbox" checked={settings.shake} onChange={(e) => patch({ shake: e.target.checked })} />
        </label>
        <label className="mt-3 flex items-center justify-between text-sm text-fg">
          Immortal (beta)
          <input type="checkbox" checked={settings.immortal} onChange={(e) => patch({ immortal: e.target.checked })} />
        </label>
        <label className="mt-3 flex items-center justify-between text-sm text-fg">
          Gyro fine aim
          <input
            type="checkbox"
            checked={settings.gyro}
            onChange={(e) => {
              patch({ gyro: e.target.checked });
              window.__crimsonInput?.gyro?.(e.target.checked);
            }}
          />
        </label>
        <p className="mt-6 font-display text-xs tracking-[0.2em] text-muted">CAMERA</p>
        <div className="mt-2 flex gap-2">
          {(
            [
              ["fps", "Eye"],
              ["tps", "Shoulder"],
              ["spec", "Spectate"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => patch({ cam: id })}
              className={`flex-1 rounded-md border px-2 py-2 font-display text-xs tracking-widest ${
                settings.cam === id ? "border-crimson bg-crimson/20 text-fg" : "border-border bg-raised text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-subtle">V cycles first eye · over shoulder · spectator</p>
        <p className="mt-6 font-display text-xs tracking-[0.2em] text-muted">RESOLUTION</p>
        <div className="mt-2 flex gap-2">
          {([360, 720, 1080] as const).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => patch({ quality: q })}
              className={`flex-1 rounded-md border px-2 py-2 font-display text-xs tracking-widest ${
                settings.quality === q ? "border-crimson bg-crimson/20 text-fg" : "border-border bg-raised text-muted"
              }`}
            >
              {q}p
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-subtle">360p performance · 720p balanced · 1080p the palace as painted</p>
        <PadStatus />
        <label className="mt-5 block text-xs tracking-[0.2em] text-muted">VOLUME</label>
        <div className="mt-2 flex items-center gap-3">
          <button type="button" onClick={() => patch({ muted: !settings.muted })} aria-label="Mute">
            {settings.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={settings.volume}
            onChange={(e) => patch({ volume: Number(e.target.value), muted: false })}
            className="w-full accent-crimson"
          />
        </div>
        <p className="mt-6 font-display text-xs tracking-[0.2em] text-muted">CORE INPUT</p>
        <ul className="mt-2 max-h-44 space-y-1 overflow-y-auto text-xs text-subtle">
          {CONTROL_LEGEND.map((row) => (
            <li key={row.action} className="flex justify-between gap-3">
              <span className="text-fg/80">{row.action}</span>
              <span className="text-right font-mono">
                {row.kbm} · {row.pad}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Primary onClick={() => setScreen(to)}>Done</Primary>
        </div>
      </div>
    </div>
  );
}

function PadStatus() {
  const [info, setInfo] = useState(() => window.__crimsonInput?.status?.());
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const t = window.setInterval(() => setInfo(window.__crimsonInput?.status?.()), 500);
    return () => window.clearInterval(t);
  }, []);
  const hid = typeof navigator !== "undefined" && "hid" in navigator;
  return (
    <div className="mt-4 rounded-md border border-border bg-raised p-3">
      <p className="font-display text-xs tracking-[0.2em] text-muted">DUALSENSE</p>
      <p className="mt-1 text-xs text-subtle">
        {info?.connected
          ? `${info.dualsense ? "DualSense" : "Gamepad"} · ${info.path === "hid" ? "adaptive R2" : info.path === "rumble" ? "impulse R2" : "mapped"}`
          : "Wake a pad — DualSense R2 hardens as Ankh charges."}
      </p>
      {hid ? (
        <button
          type="button"
          className="mt-2 rounded-md border border-border bg-surface px-3 py-2 font-display text-xs tracking-widest text-fg"
          onClick={() => {
            void window.__crimsonInput?.pairDualSense?.().then((ok) => {
              setMsg(ok ? "Adaptive triggers paired." : "Pair cancelled.");
              setInfo(window.__crimsonInput?.status?.());
            });
          }}
        >
          Pair DualSense
        </button>
      ) : (
        <p className="mt-2 text-xs text-subtle">Adaptive HID needs Chrome. Impulse rumble still works.</p>
      )}
      {msg ? <p className="mt-1 text-xs text-crimson">{msg}</p> : null}
    </div>
  );
}

function PauseMenu() {
  const setScreen = useGame((s) => s.setScreen);
  const openSettings = useGame((s) => s.openSettings);
  const openCodex = useGame((s) => s.openCodex);
  const hud = useGame((s) => s.hud);
  const profile = useGame((s) => s.profile);
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-bg/70 p-5">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6">
        <p className="font-display text-xs tracking-[0.3em] text-crimson">PAUSED · CODE {profile.padded}</p>
        <h2 className="mt-1 font-display text-2xl text-fg">The palace waits</h2>
        <p className="mt-2 text-sm text-muted">
          Names {hud.runes.length}/6 · {profile.glyphs}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Primary onClick={() => setScreen("playing")}>Resume</Primary>
          <Ghost onClick={() => openCodex("paused")}>Codex</Ghost>
          <Ghost
            onClick={() => {
              setScreen("playing");
              window.__crimsonInput?.tree?.();
            }}
          >
            Skill tree · K
          </Ghost>
          <Ghost onClick={() => openSettings("paused")}>Settings</Ghost>
          <Ghost onClick={() => setScreen("title")}>Quit to title</Ghost>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-raised px-5 py-3 font-display text-sm tracking-[0.12em] text-fg"
          >
            GitHub · heads4281-spec
          </a>
          <a
            href={HOLO_ATLAS_HREF}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-raised px-5 py-3 font-display text-sm tracking-[0.12em] text-holo"
          >
            HTML5 holographic atlas
          </a>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-subtle">{PAD_BLURB}</p>
      </div>
    </div>
  );
}

function End({ kind }: { kind: "dead" | "victory" }) {
  const startRun = useGame((s) => s.startRun);
  const setScreen = useGame((s) => s.setScreen);
  const hud = useGame((s) => s.hud);
  const profile = useGame((s) => s.profile);
  const win = kind === "victory";
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-bg/80 p-5">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 text-center">
        <p className="font-display text-xs tracking-[0.3em] text-crimson">{win ? "CYCLE COMPLETE" : "UNWRITTEN"}</p>
        <h2 className="mt-2 font-display text-3xl text-fg">{win ? "The Key is turned" : "The runes close"}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {win
            ? "The Offering is accepted under the turning arms of the galaxy. Walk the grounds again, or leave while the door still remembers your name."
            : "A Type VII will does not forgive trespass. Rise at the last crystal checkpoint, or deploy again from the Threshold."}
        </p>
        <p className="mt-4 text-xs tabular-nums text-subtle">
          Code {profile.padded} · Names {hud.runes.length}/6 · Kills {hud.kills}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Primary
            onClick={() => {
              if (win) {
                window.__crimsonRemain?.();
                setScreen("playing");
              } else {
                window.__crimsonRise?.();
                setScreen("playing");
              }
            }}
          >
            {win ? "Remain on the grounds" : "Rise at checkpoint"}
          </Primary>
          <Ghost onClick={() => (win ? startRun() : startRun())}>
            {win ? "Walk the palace again" : "Deploy from the Threshold"}
          </Ghost>
          {win ? <Ghost onClick={() => setScreen("title")}>Leave through the rift</Ghost> : null}
        </div>
      </div>
    </div>
  );
}

function Gate({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-crimson bg-transparent px-8 py-3.5 font-display text-[1rem] tracking-[0.18em] text-fg transition-all duration-[var(--motion-medium)] hover:bg-crimson hover:text-bg hover:shadow-[0_0_40px_#ff0033]"
    >
      {children}
    </button>
  );
}

function Primary({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md bg-fg px-5 py-3 font-display text-sm tracking-[0.12em] text-bg transition-transform duration-[var(--motion-quick)] hover:opacity-90 active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

function Ghost({
  onClick,
  children,
  aria,
}: {
  onClick: () => void;
  children: ReactNode;
  aria?: string;
}) {
  return (
    <button
      type="button"
      aria-label={aria}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-raised px-5 py-3 font-display text-sm tracking-[0.12em] text-fg transition-opacity duration-[var(--motion-quick)] hover:bg-surface"
    >
      {children}
    </button>
  );
}

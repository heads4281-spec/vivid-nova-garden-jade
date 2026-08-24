import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled, signOut } from "@/lib/auth/client";
import { loadProgress, saveProgress } from "@/lib/saves";
import { padCode } from "./codes";
import { loadRun, saveRun, emptySave } from "./persist";
import { useGame } from "./store";
import type { CharacterId } from "./arsenal";

export function CloudSync() {
  const { user, isPending } = useCurrentUserState();
  const seed = useGame((s) => s.seed);
  const character = useGame((s) => s.settings.character);
  const tick = useGame((s) => s.hud.checkpoint);
  const skills = useGame((s) => s.hud.skills);
  const skillPts = useGame((s) => s.hud.skillPts);
  const kills = useGame((s) => s.hud.kills);
  const [tickLocal, setTickLocal] = useState(0);
  const [cloudReady, setCloudReady] = useState(false);

  useEffect(() => {
    const onSave = () => setTickLocal((n) => n + 1);
    window.addEventListener("crimson-run-save", onSave);
    return () => window.removeEventListener("crimson-run-save", onSave);
  }, []);

  useEffect(() => {
    if (isPending || !user || !authEnabled) {
      setCloudReady(false);
      return;
    }
    let live = true;
    void loadProgress()
      .then((save) => {
        if (!live || !save) return;
        useGame.getState().setCloudSave(save);
        const urlCode = new URLSearchParams(window.location.search).get("code");
        if (save.code && !urlCode) useGame.getState().loadCode(save.code);
        if (save.characterId) useGame.getState().setCharacter(save.characterId as CharacterId);
        const local = loadRun() ?? emptySave(save.code);
        saveRun({
          ...local,
          version: 4,
          code: save.code || local.code,
          runes: save.runes?.length ? save.runes : local.runes,
          skills: save.skills?.length ? save.skills : local.skills,
          skillPts: save.skillPts ?? local.skillPts,
          characterId: save.characterId || local.characterId,
          checkpoint: save.checkpoint ?? local.checkpoint,
          pity: save.pity ?? local.pity,
          kills: save.kills ?? local.kills,
        });
      })
      .catch(() => undefined)
      .finally(() => {
        if (live) setCloudReady(true);
      });
    return () => {
      live = false;
    };
  }, [isPending, user]);

  useEffect(() => {
    if (!cloudReady || isPending || !user || !authEnabled) return;
    const t = window.setTimeout(() => {
      const run = loadRun();
      void saveProgress({
        data: {
          code: padCode(seed),
          runes: run?.runes ?? [],
          skills: run?.skills ?? skills,
          skillPts: run?.skillPts ?? skillPts,
          characterId: character,
          checkpoint: run?.checkpoint ?? null,
          pity: run?.pity ?? {},
          kills: run?.kills ?? kills,
        },
      }).catch(() => undefined);
    }, 1400);
    return () => window.clearTimeout(t);
  }, [cloudReady, isPending, user, seed, character, tick, tickLocal, skills, skillPts, kills]);

  return null;
}

export function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  const [signingOut, setSigningOut] = useState(false);
  if (isPending) {
    return <div className="h-11 w-28 animate-pulse rounded-md border border-border bg-surface/60" aria-hidden />;
  }
  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-flex h-11 items-center rounded-md border border-border bg-surface/80 px-4 font-display text-xs tracking-[0.22em] text-fg hover:border-crimson"
      >
        SIGN IN
      </Link>
    );
  }
  const label = user.displayName ?? user.primaryEmail ?? "Sovereign";
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-surface/80 py-1 pl-1 pr-2">
      {user.profileImageUrl ? (
        <img src={user.profileImageUrl} alt="" className="size-8 rounded-full object-cover" />
      ) : (
        <span className="grid size-8 place-items-center rounded-full bg-crimson/30 font-display text-xs text-fg">
          {label.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="hidden max-w-[9rem] truncate font-display text-[0.65rem] tracking-widest text-fg sm:inline">
        {label}
      </span>
      {authEnabled ? (
        <button
          type="button"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            void signOut().catch(() => setSigningOut(false));
          }}
          className="h-8 px-1 font-display text-[0.6rem] tracking-widest text-muted hover:text-crimson disabled:opacity-50"
        >
          {signingOut ? "…" : "OUT"}
        </button>
      ) : null}
    </div>
  );
}

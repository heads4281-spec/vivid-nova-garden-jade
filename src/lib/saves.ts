import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

const checkpointSchema = z
  .object({
    id: z.string().min(1).max(32),
    name: z.string().min(1).max(64),
    x: z.number(),
    y: z.number(),
    z: z.number(),
    yaw: z.number(),
  })
  .nullable();

const saveSchema = z.object({
  code: z.string().min(1).max(8),
  runes: z.array(z.string()).max(8),
  skills: z.array(z.string()).max(32),
  skillPts: z.number().int().min(0).max(99),
  characterId: z.string().min(1).max(32),
  checkpoint: checkpointSchema.optional(),
  pity: z.record(z.string(), z.number()).optional(),
  kills: z.number().int().min(0).max(99999).optional(),
});

export type CloudSave = z.infer<typeof saveSchema>;

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const loadProgress = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      code: string;
      runes: string;
      skills: string;
      skill_pts: number;
      character_id: string;
      checkpoint: string;
      pity: string;
      kills: number;
    }>`select code, runes, skills, skill_pts, character_id, checkpoint, pity, kills from sovereign_saves where user_id = ${context.userId} limit 1`;
    const row = rows[0];
    if (!row) return null;
    return {
      code: row.code,
      runes: parseJson<string[]>(row.runes, []),
      skills: parseJson<string[]>(row.skills, ["ember-fortitude"]),
      skillPts: Number(row.skill_pts) || 0,
      characterId: row.character_id,
      checkpoint: parseJson<CloudSave["checkpoint"]>(row.checkpoint, null),
      pity: parseJson<Record<string, number>>(row.pity, {}),
      kills: Number(row.kills) || 0,
    } satisfies CloudSave;
  });

export const saveProgress = createServerFn({ method: "POST" })
  .validator((input: CloudSave) => saveSchema.parse(input))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const runes = JSON.stringify(data.runes);
    const skills = JSON.stringify(data.skills);
    const checkpoint = JSON.stringify(data.checkpoint ?? null);
    const pity = JSON.stringify(data.pity ?? {});
    const kills = data.kills ?? 0;
    await sql`
      insert into sovereign_saves (user_id, code, runes, skills, skill_pts, character_id, checkpoint, pity, kills, updated_at)
      values (${context.userId}, ${data.code}, ${runes}, ${skills}, ${data.skillPts}, ${data.characterId}, ${checkpoint}, ${pity}, ${kills}, now())
      on conflict (user_id) do update set
        code = excluded.code,
        runes = excluded.runes,
        skills = excluded.skills,
        skill_pts = excluded.skill_pts,
        character_id = excluded.character_id,
        checkpoint = excluded.checkpoint,
        pity = excluded.pity,
        kills = excluded.kills,
        updated_at = now()
    `;
    return { ok: true as const };
  });

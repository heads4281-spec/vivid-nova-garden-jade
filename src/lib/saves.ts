import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

const saveSchema = z.object({
  code: z.string().min(1).max(8),
  runes: z.array(z.string()).max(8),
  skills: z.array(z.string()).max(32),
  skillPts: z.number().int().min(0).max(99),
  characterId: z.string().min(1).max(32),
});

export type CloudSave = z.infer<typeof saveSchema>;

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
    }>`select code, runes, skills, skill_pts, character_id from sovereign_saves where user_id = ${context.userId} limit 1`;
    const row = rows[0];
    if (!row) return null;
    let runes: string[] = [];
    let skills: string[] = ["ember-fortitude"];
    try {
      runes = JSON.parse(row.runes) as string[];
      skills = JSON.parse(row.skills) as string[];
    } catch {
      /* keep defaults */
    }
    return {
      code: row.code,
      runes,
      skills,
      skillPts: Number(row.skill_pts) || 0,
      characterId: row.character_id,
    } satisfies CloudSave;
  });

export const saveProgress = createServerFn({ method: "POST" })
  .validator((input: CloudSave) => saveSchema.parse(input))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const runes = JSON.stringify(data.runes);
    const skills = JSON.stringify(data.skills);
    await sql`
      insert into sovereign_saves (user_id, code, runes, skills, skill_pts, character_id, updated_at)
      values (${context.userId}, ${data.code}, ${runes}, ${skills}, ${data.skillPts}, ${data.characterId}, now())
      on conflict (user_id) do update set
        code = excluded.code,
        runes = excluded.runes,
        skills = excluded.skills,
        skill_pts = excluded.skill_pts,
        character_id = excluded.character_id,
        updated_at = now()
    `;
    return { ok: true as const };
  });

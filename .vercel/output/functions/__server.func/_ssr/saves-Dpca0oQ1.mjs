import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { Ht as array, Jt as object, Zt as string, qt as number } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-RLHmpgbK.mjs";
import { r as getSql } from "./db-DS1HNa3r.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/saves-Dpca0oQ1.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var saveSchema = object({
	code: string().min(1).max(8),
	runes: array(string()).max(8),
	skills: array(string()).max(32),
	skillPts: number().int().min(0).max(99),
	characterId: string().min(1).max(32)
});
var loadProgress_createServerFn_handler = createServerRpc({
	id: "2e8bfa3424627069191a5f8f1408a3a1bf063549e46ba15a7b3ea6db6eeb01cb",
	name: "loadProgress",
	filename: "src/lib/saves.ts"
}, (opts) => loadProgress.__executeServer(opts));
var loadProgress = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadProgress_createServerFn_handler, async ({ context }) => {
	const row = (await (await getSql())`select code, runes, skills, skill_pts, character_id from sovereign_saves where user_id = ${context.userId} limit 1`)[0];
	if (!row) return null;
	let runes = [];
	let skills = ["ember-fortitude"];
	try {
		runes = JSON.parse(row.runes);
		skills = JSON.parse(row.skills);
	} catch {}
	return {
		code: row.code,
		runes,
		skills,
		skillPts: Number(row.skill_pts) || 0,
		characterId: row.character_id
	};
});
var saveProgress_createServerFn_handler = createServerRpc({
	id: "5b2cc19255520ee706791ab651ff042d4b843eab0a79e7a4342205a4fe9de600",
	name: "saveProgress",
	filename: "src/lib/saves.ts"
}, (opts) => saveProgress.__executeServer(opts));
var saveProgress = createServerFn({ method: "POST" }).validator((input) => saveSchema.parse(input)).middleware([authMiddleware]).handler(saveProgress_createServerFn_handler, async ({ context, data }) => {
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
	return { ok: true };
});
//#endregion
export { loadProgress_createServerFn_handler, saveProgress_createServerFn_handler };

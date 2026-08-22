import { chromium } from "playwright";
import { mkdirSync } from "fs";

mkdirSync("/workspace/screenshots", { recursive: true });
const browser = await chromium.launch({ args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded", timeout: 25000 });
await page.getByRole("button", { name: /enter the palace/i }).click();
await page.getByRole("button", { name: /^deploy$/i }).click();
await page.waitForFunction(() => Boolean(window.__controlsTest && window.__crimsonAudio), { timeout: 20000 });

const probe = await page.evaluate(async () => {
  const a = window.__crimsonAudio;
  a.unlock();
  a.setMuted(false);
  a.setVolume(0.7);
  const kinds = [];
  const play = (name, fn) => {
    try {
      fn();
      kinds.push(name);
    } catch (e) {
      kinds.push("FAIL:" + name + ":" + e);
    }
  };
  play("rifle", () => a.fireWeapon(0, "hitscan", false));
  play("smg", () => a.fireWeapon(2, "hitscan", true));
  play("sniper", () => a.fireWeapon(4, "hitscan", false));
  play("rail", () => a.fireWeapon(5, "rail"));
  play("beam", () => a.fireWeapon(3, "beam"));
  play("caster", () => a.fireWeapon(1, "projectile"));
  play("axe", () => a.meleeSwing(6));
  play("sword", () => a.meleeSwing(7));
  play("scythe", () => a.meleeSwing(8));
  play("lance", () => a.meleeSwing(9));
  play("hammer", () => a.meleeSwing(10));
  play("fist", () => a.meleeSwing(11));
  play("strike-flesh", () => a.strike("flesh"));
  play("strike-crystal", () => a.strike("crystal"));
  play("hurt", () => a.playerHurt(18));
  play("death-wraith", () => a.enemyDeath("wraith"));
  play("death-construct", () => a.enemyDeath("construct"));
  play("atk-sentinel", () => a.enemyAttack("sentinel"));
  play("skill-fortitude", () => a.skill("fortitude"));
  play("skill-surge", () => a.skill("surge", "dual-surge"));
  play("skill-whisper", () => a.skill("whisper", "final-whisper"));
  play("skill-ritual", () => a.skill("ritual"));
  play("skill-tide", () => a.skill("tide"));
  play("skill-coil", () => a.skill("coil"));
  play("skill-lunge", () => a.skill("lunge"));
  play("skill-carapace", () => a.skill("carapace"));
  play("jump", () => a.jump());
  play("land", () => a.land(0.8));
  play("step", () => a.step());
  play("reload", () => a.reload());
  play("pickup-hp", () => a.pickupKind("health"));
  play("rune", () => a.rune());
  play("ui-bag", () => a.ui("bag"));
  a.chargeHum(0.7);
  a.setCombat(0.8);
  a.chargeHum(0);
  return {
    kinds,
    ctx: a.ctx?.state || "none",
    sampleRate: a.ctx?.sampleRate || 0,
    voices: a.voices,
  };
});

await page.evaluate(() => {
  window.__controlsTest.setYaw(0);
  window.__controlsTest.setPos(0, 48);
  window.__controlsTest.setKeys(["KeyW", "Space"]);
  window.__crimsonInput?.fire(true);
  window.__crimsonInput?.skill?.();
});
await page.waitForTimeout(500);
await page.evaluate(() => {
  window.__controlsTest.setKeys([]);
  window.__crimsonInput?.fire(false);
});
await page.screenshot({ path: "/workspace/screenshots/audio-play.png" });

const pos = await page.evaluate(() => window.__controlsTest.getPos());
const fails = probe.kinds.filter((k) => String(k).startsWith("FAIL"));
const out = {
  errors,
  fails,
  played: probe.kinds.length,
  ctx: probe.ctx,
  sampleRate: probe.sampleRate,
  moved: +(pos.z - 48).toFixed(3),
};
console.log(JSON.stringify(out, null, 2));
if (errors.length || fails.length || probe.ctx === "none" || probe.kinds.length < 20) process.exit(1);
console.log("AUDIO PASS");
await browser.close();

import { chromium } from "playwright";
import { mkdirSync } from "fs";
mkdirSync("/workspace/screenshots", { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded", timeout: 25000 });
await page.getByRole("button", { name: /enter the palace/i }).click();
await page.getByRole("button", { name: /^deploy$/i }).click();
await page.waitForFunction(() => Boolean(window.__controlsTest?.dump), { timeout: 20000 });
await page.waitForFunction(() => {
  const d = window.__controlsTest.dump?.();
  return d && d.running && d.screen === "playing" && !d.paused;
}, { timeout: 8000 });
await page.waitForTimeout(200);

const spawn = await page.evaluate(() => window.__controlsTest.getPos());

await page.evaluate(() => {
  window.__controlsTest.setYaw(0);
  window.__controlsTest.setKeys(["KeyW"]);
});
await page.waitForFunction(() => {
  const d = window.__controlsTest.dump?.();
  return d && Math.hypot(d.vx || 0, d.vz || 0) > 1.2;
}, { timeout: 4000 }).catch(() => {});
await page.waitForTimeout(500);
const walked = await page.evaluate(() => {
  const p = window.__controlsTest.getPos();
  const spd = window.__controlsTest.getSpeed();
  const dump = window.__controlsTest.dump?.();
  window.__controlsTest.setKeys([]);
  return { p, spd, dump };
});

await page.evaluate(() => {
  window.__controlsTest.setYaw(0);
  window.__controlsTest.setKeys(["KeyD"]);
});
await page.waitForFunction(() => {
  const p = window.__controlsTest.getPos();
  return p && p.x > 0.12;
}, { timeout: 4000 }).catch(() => {});
await page.waitForTimeout(200);
const strafe = await page.evaluate(() => {
  const p = window.__controlsTest.getPos();
  window.__controlsTest.setKeys([]);
  return p;
});

await page.evaluate(() => window.__crimsonInput.camera());
await page.waitForFunction(() => /SHOULDER/i.test(document.body.innerText), { timeout: 4000 });
await page.waitForTimeout(120);
await page.screenshot({ path: "/workspace/screenshots/bugfix-tps.png" });

await page.evaluate(() => {
  window.__crimsonInput.camera();
});
await page.waitForFunction(() => /SPECTATE/i.test(document.body.innerText), { timeout: 4000 });
await page.waitForTimeout(120);
await page.screenshot({ path: "/workspace/screenshots/bugfix-spec.png" });
await page.evaluate(() => {
  window.__crimsonInput.camera();
  window.__crimsonInput.fire(true);
  window.__crimsonInput.skill();
});
await page.waitForFunction(() => /FIRST/i.test(document.body.innerText), { timeout: 4000 });
await page.waitForTimeout(200);
await page.evaluate(() => window.__crimsonInput.fire(false));
await page.screenshot({ path: "/workspace/screenshots/bugfix-fps.png" });

const body = await page.evaluate(() => document.body.innerText);
const hud = {
  hasPalace: /palace|threshold|gate/i.test(body),
  hasWeapon: /spark|rifle|arm/i.test(body),
  camHud: /SHOULDER|SPECTATE|FIRST/i.test(body),
  paused: /palace waits/i.test(body),
};

const out = {
  errors,
  spawn,
  walkedZ: +(walked.p.z - spawn.z).toFixed(3),
  walkedX: +walked.p.x.toFixed(3),
  speed: +walked.spd.toFixed(3),
  strafeX: +strafe.x.toFixed(3),
  camHud: hud.camHud,
  hud,
  dump: walked.dump,
};
console.log(JSON.stringify(out, null, 2));
if (errors.length) process.exit(1);
if (hud.paused) {
  console.error("PAUSE FAIL");
  process.exit(1);
}
if (walked.p.z >= spawn.z - 0.35 || walked.spd < 0.8) {
  console.error("MOVE FAIL");
  process.exit(1);
}
if (strafe.x <= spawn.x + 0.1) {
  console.error("STRAFE FAIL");
  process.exit(1);
}
console.log("BUGFIX PASS");
await browser.close();

import { chromium } from "playwright";
import { mkdirSync } from "fs";

mkdirSync("/workspace/screenshots", { recursive: true });
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

console.log("goto");
await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded", timeout: 20000 });
console.log("title", await page.title());
const enter = page.getByRole("button", { name: /enter the palace/i }).first();
await enter.waitFor({ timeout: 15000 });
await enter.click();
console.log("clicked enter");
const deploy = page.getByRole("button", { name: /^deploy$/i });
await deploy.waitFor({ timeout: 15000 });
await deploy.click();
console.log("clicked deploy");
await page.waitForFunction(() => Boolean(window.__controlsTest), { timeout: 25000 });
console.log("game ready");
await page.waitForTimeout(800);
const start = await page.evaluate(() => window.__controlsTest.getPos());
await page.evaluate(() => {
  window.__controlsTest.setYaw(0);
  window.__controlsTest.setKeys(["KeyW"]);
});
await page.waitForTimeout(900);
const mid = await page.evaluate(() => ({ pos: window.__controlsTest.getPos(), dump: window.__controlsTest.dump() }));
await page.evaluate(() => window.__controlsTest.setKeys([]));
await page.screenshot({ path: "/workspace/screenshots/art-play.png" });
console.log("shot play");
await page.keyboard.press("KeyI");
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/art-bag.png" });
const bag = await page.getByRole("button", { name: /close/i }).count();
await page.keyboard.press("KeyI");
await page.waitForTimeout(200);
await page.keyboard.press("KeyM");
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/art-map.png" });
const atlas = await page.locator('img[alt="Crimson Sovereign open world"]').count();
const pulse = await page.locator('img[src="/ui/pulse-frame.png"]').count();
console.log(JSON.stringify({
  errors,
  start,
  midPos: mid.pos,
  dump: mid.dump,
  moved: +(start.z - mid.pos.z).toFixed(3),
  bag,
  atlas,
  pulse,
}, null, 2));
await browser.close();
if (errors.length) process.exit(1);
console.log("PASS");

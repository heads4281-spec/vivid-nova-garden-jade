import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("/workspace/screenshots", { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

const shot = (path) => page.screenshot({ path, timeout: 8000 }).catch((e) => console.warn("shot", path, e.message));

await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForTimeout(900);
await shot("/workspace/screenshots/qa-title.png");

await page.goto("http://127.0.0.1:8080/login", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(500);
await shot("/workspace/screenshots/qa-login.png");

await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(700);
await page.getByRole("button", { name: /ENTER THE PALACE/i }).click();
await page.waitForTimeout(500);
await shot("/workspace/screenshots/qa-briefing.png");
await page.getByRole("button", { name: /Deploy/i }).click();
await page.waitForTimeout(5500);
await shot("/workspace/screenshots/qa-play.png");

const dump = await page.evaluate(() => {
  const t = window.__controlsTest;
  const canvas = document.querySelector("canvas");
  let sample = null;
  if (canvas) {
    try {
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      sample = { w: canvas.width, h: canvas.height, cw: canvas.clientWidth, ch: canvas.clientHeight };
      if (gl) {
        const px = new Uint8Array(4);
        gl.readPixels(Math.floor(canvas.width / 2), Math.floor(canvas.height / 3), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        sample.mid = [...px];
        gl.readPixels(8, 8, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        sample.corner = [...px];
      }
    } catch (e) {
      sample = { err: String(e) };
    }
  }
  return {
    hasTest: Boolean(t),
    dump: t?.dump?.() ?? null,
    pos: t?.getPos?.() ?? null,
    yaw: t?.getYaw?.() ?? null,
    canvas: Boolean(canvas),
    sample,
  };
});

if (dump.hasTest) {
  await page.evaluate(() => window.__controlsTest.setKeys(["KeyW"]));
  await page.waitForTimeout(400);
  const afterW = await page.evaluate(() => ({
    pos: window.__controlsTest.getPos(),
    speed: window.__controlsTest.getSpeed(),
    yaw: window.__controlsTest.getYaw(),
  }));
  await page.evaluate(() => window.__controlsTest.setKeys([]));
  await page.waitForTimeout(80);
  const x0 = afterW.pos.x;
  await page.evaluate(() => window.__controlsTest.setKeys(["KeyA"]));
  await page.waitForTimeout(400);
  const afterA = await page.evaluate(() => ({
    pos: window.__controlsTest.getPos(),
    speed: window.__controlsTest.getSpeed(),
  }));
  await page.evaluate(() => window.__controlsTest.setKeys([]));
  dump.afterW = afterW;
  dump.afterA = afterA;
  dump.aWentLeft = afterA.pos.x < x0 - 0.05;
}

await shot("/workspace/screenshots/qa-play-move.png");
console.log(JSON.stringify({ errors, dump }, null, 2));
await browser.close();

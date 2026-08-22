import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded", timeout: 25000 });
await page.getByRole("button", { name: /enter the palace/i }).click();
await page.getByRole("button", { name: /^deploy$/i }).click();
await page.waitForFunction(() => Boolean(window.__controlsTest), { timeout: 20000 });
await page.waitForTimeout(500);

const before = await page.evaluate(() => window.__controlsTest.dump?.() ?? null);
await page.evaluate(() => {
  window.__controlsTest.setYaw(0);
  window.__controlsTest.setKeys(["KeyW"]);
});
await page.waitForTimeout(700);
const after = await page.evaluate(() => {
  const d = window.__controlsTest.dump?.() ?? null;
  const p = window.__controlsTest.getPos();
  const spd = window.__controlsTest.getSpeed();
  window.__controlsTest.setKeys([]);
  return { d, p, spd };
});

console.log(JSON.stringify({ errors, before, after, bodyPaused: /palace waits/i.test(await page.evaluate(() => document.body.innerText)) }, null, 2));
await page.screenshot({ path: "/workspace/screenshots/diag.png" });
await browser.close();

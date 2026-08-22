import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded", timeout: 25000 });
await page.getByRole("button", { name: /enter the palace/i }).click();
await page.getByRole("button", { name: /^deploy$/i }).click();
await page.waitForFunction(() => Boolean(window.__controlsTest?.dump), { timeout: 20000 });
await page.waitForTimeout(400);

const y0 = await page.evaluate(() => window.__controlsTest.getPos().y);
await page.evaluate(() => window.__crimsonInput.jump());
await page.waitForFunction(() => window.__controlsTest.getPos().y > 0.55, { timeout: 4000 }).catch(() => {});
const mid = await page.evaluate(() => window.__controlsTest.getPos());
await page.waitForTimeout(900);
const land = await page.evaluate(() => window.__controlsTest.dump());

const out = { errors, y0, yMid: mid.y, groundedAfter: land.grounded, pyAfter: land.py };
console.log(JSON.stringify(out, null, 2));
if (errors.length) process.exit(1);
if (mid.y <= y0 + 0.12) {
  console.error("JUMP FAIL");
  process.exit(1);
}
console.log("JUMP PASS");
await browser.close();

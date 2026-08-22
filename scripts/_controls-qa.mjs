import { chromium } from "playwright";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.getByRole("button", { name: /enter the palace/i }).click();
await page.getByRole("button", { name: /^deploy$/i }).click();
await page.waitForFunction(() => Boolean(window.__controlsTest), { timeout: 15000 });
await page.evaluate(() => {
  window.__controlsTest.setYaw(0);
  window.__controlsTest.setPos(0, 48);
  window.__controlsTest.setKeys(["KeyW"]);
});
await page.waitForTimeout(400);
const w = await page.evaluate(() => window.__controlsTest.getPos());
await page.evaluate(() => window.__controlsTest.setKeys([]));
await page.getByRole("button", { name: /pause/i }).click();
const pauseText = await page.locator("body").innerText();
await page.screenshot({ path: "/workspace/screenshots/playing-pad.png" });
console.log(JSON.stringify({
  errors,
  wdz: +(w.z - 48).toFixed(3),
  hasRT: /RT fire/i.test(pauseText),
  hasGyro: /Gyro fine aim/i.test(pauseText),
  pairFn: await page.evaluate(() => typeof window.__crimsonInput?.pairDualSense),
  status: await page.evaluate(() => window.__crimsonInput?.status?.()),
}, null, 2));
if (errors.length || w.z >= 47.98) process.exit(1);
console.log("PASS");
await browser.close();

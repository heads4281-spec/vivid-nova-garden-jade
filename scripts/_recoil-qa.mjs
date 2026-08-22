import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
const log = (...a) => console.log(...a);

log("goto");
await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForTimeout(1200);
const clickedEnter = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((el) => /enter the palace/i.test(el.textContent || ""));
  b?.click();
  return b?.textContent || null;
});
log("enter", clickedEnter);
await page.waitForTimeout(1500);
const clickedDeploy = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((el) => /^deploy$/i.test((el.textContent || "").trim()));
  b?.scrollIntoView({ block: "center" });
  b?.click();
  return b?.textContent || document.body.innerText.slice(0, 120);
});
log("deploy", clickedDeploy);
let ready = false;
for (let i = 0; i < 50; i++) {
  ready = await page.evaluate(() => Boolean(window.__controlsTest?.dump?.()?.simReady));
  if (ready) break;
  await page.waitForTimeout(200);
}
log("ready", ready);
if (!ready) {
  log(await page.evaluate(() => document.body.innerText.slice(0, 400)));
  process.exit(1);
}

await page.evaluate(() => {
  window.__controlsTest.setYaw(0);
  window.__controlsTest.setPos(0, 62);
});

const before = await page.evaluate(() => window.__controlsTest.dump().recoil);
log("before", before);

for (let i = 0; i < 8; i++) {
  await page.evaluate(() => window.__controlsTest.fire(true));
  await page.waitForTimeout(40);
  await page.evaluate(() => window.__controlsTest.fire(false));
  await page.waitForTimeout(140);
}

const rifle = await page.evaluate(() => window.__controlsTest.dump().recoil);
log("rifle", rifle);

await page.evaluate(() => window.__crimsonInput?.arm?.(2));
await page.waitForTimeout(80);
await page.evaluate(() => window.__controlsTest.fire(true));
await page.waitForTimeout(520);
const smg = await page.evaluate(() => window.__controlsTest.dump().recoil);
log("smg", smg);
await page.evaluate(() => window.__controlsTest.fire(false));
await page.waitForTimeout(900);
const settled = await page.evaluate(() => window.__controlsTest.dump().recoil);
log("settled", settled);

await page.evaluate(() => window.__crimsonInput?.arm?.(4));
await page.waitForTimeout(60);
await page.evaluate(() => window.__controlsTest.fire(true));
await page.waitForTimeout(50);
await page.evaluate(() => window.__controlsTest.fire(false));
await page.waitForTimeout(40);
const sniper = await page.evaluate(() => window.__controlsTest.dump().recoil);
log("sniper", sniper);

const result = {
  errors,
  rifleKicked: Math.abs(rifle?.cam?.[0] || 0) > 0.002 || (rifle?.shot || 0) > 0,
  smgHot: (smg?.heat || 0) > 0.15 || (smg?.shot || 0) > 3,
  recovered: (settled?.heat || 0) < (smg?.heat || 1),
};
log(JSON.stringify(result));
const ok = result.rifleKicked && result.smgHot && result.recovered && errors.length === 0;
await browser.close().catch(() => {});
if (!ok) {
  console.error("FAIL");
  process.exit(1);
}
console.log("PASS");

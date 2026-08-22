import { chromium } from "playwright";
import fs from "node:fs";

const t0 = Date.now();
const log = (s) => console.log(Date.now() - t0 + "ms", s);
log("start");
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded", timeout: 25000 });
await page.waitForFunction(
  () => [...document.querySelectorAll("button")].some((el) => /enter the palace/i.test(el.textContent || "")),
  { timeout: 15000 },
);
await page.waitForTimeout(900);
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((el) => /enter the palace/i.test(el.textContent || ""));
  b?.click();
});
await page.waitForFunction(
  () => /THE OPEN PALACE UNDER THE MILKY WAY/i.test(document.body.innerText),
  { timeout: 10000 },
);
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((el) => /^deploy$/i.test((el.textContent || "").trim()));
  b?.scrollIntoView({ block: "center" });
  b?.click();
});
await page.waitForFunction(() => window.__controlsTest?.engine === 5, { timeout: 35000 });
await page.waitForFunction(() => window.__controlsTest.dump?.().simReady === true, { timeout: 20000 });

log("engine ready");
const boot = await page.evaluate(() => window.__controlsTest.dump());
log("boot " + JSON.stringify({ engine: boot.engine, simReady: boot.simReady, calls: boot.calls }));
log("screenshot");
const dataUrl = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  if (!c) return "";
  return c.toDataURL("image/png");
});
if (dataUrl.startsWith("data:image")) {
  const buf = Buffer.from(dataUrl.split(",")[1], "base64");
  fs.writeFileSync("/workspace/screenshots/engine5-play.png", buf);
  fs.writeFileSync("/workspace/screenshots/playing.png", buf);
  fs.writeFileSync("/workspace/screenshots/qa-play.png", buf);
  log("canvas dump " + buf.length);
} else {
  log("no canvas data");
}
log("screenshots done");

await page.evaluate(() => {
  window.__controlsTest.setYaw(0);
  window.__controlsTest.setPos(0, 58);
  window.__controlsTest.setKeys(["KeyW"]);
});
await page.waitForFunction(() => window.__controlsTest.getPos().z < 57.2, { timeout: 8000 });
const afterW = await page.evaluate(() => window.__controlsTest.getPos());
const speedW = await page.evaluate(() => window.__controlsTest.getSpeed());
log("W " + afterW.z);

await page.evaluate(() => {
  window.__controlsTest.setKeys([]);
  window.__controlsTest.setPos(0, 58);
  window.__controlsTest.setYaw(0);
  window.__controlsTest.setKeys(["KeyD"]);
});
await page.waitForFunction(() => window.__controlsTest.getPos().x > 0.4, { timeout: 8000 });
const afterD = await page.evaluate(() => window.__controlsTest.getPos());
log("D " + afterD.x);

await page.evaluate(() => {
  window.__controlsTest.setKeys([]);
  window.__controlsTest.setPos(0, 58);
  window.__controlsTest.setYaw(0);
  window.__controlsTest.setKeys(["KeyA"]);
});
await page.waitForFunction(() => window.__controlsTest.getPos().x < -0.4, { timeout: 8000 });
const afterA = await page.evaluate(() => window.__controlsTest.getPos());
log("A " + afterA.x);

await page.evaluate(() => {
  window.__controlsTest.setKeys([]);
  window.__controlsTest.setPos(0, 58);
  window.__controlsTest.setYaw(0);
});
const y0 = await page.evaluate(() => window.__controlsTest.getPos().y);
await page.evaluate(() => window.__controlsTest.jump());
await page.waitForFunction(() => window.__controlsTest.getPos().y > 0.55, { timeout: 8000 });
const jumpAir = await page.evaluate(() => ({
  y: window.__controlsTest.getPos().y,
  grounded: window.__controlsTest.getGrounded(),
}));
const jumpLand = { y: jumpAir.y, grounded: jumpAir.grounded };
log("jump " + JSON.stringify({ y0, jumpAir }));

await page.evaluate(() => {
  window.__controlsTest.setKeys([]);
  window.__controlsTest.fire(true);
});
await page.waitForTimeout(120);
await page.evaluate(() => window.__controlsTest.fire(false));

const magAfter = await page.evaluate(() => window.__controlsTest.dump());

const verdict = {
  errors,
  engine: boot.engine,
  simReady: boot.simReady,
  calls: magAfter.calls,
  tris: magAfter.tris,
  err: magAfter.err,
  kids: magAfter.kids,
  wdz: +(afterW.z - 58).toFixed(3),
  speedW: +speedW.toFixed(3),
  dxD: +(afterD.x - 0).toFixed(3),
  dxA: +(afterA.x - 0).toFixed(3),
  jumpY0: +y0.toFixed(3),
  jumpAirY: +jumpAir.y.toFixed(3),
  jumpAirGround: jumpAir.grounded,
  jumpLandY: +jumpLand.y.toFixed(3),
  jumpLandGround: jumpLand.grounded,
};

const fail =
  errors.length ||
  boot.engine !== 5 ||
  !boot.simReady ||
  afterW.z >= 57.7 ||
  afterD.x <= 0.15 ||
  afterA.x >= -0.15 ||
  jumpAir.y <= y0 + 0.12 ||
  magAfter.calls < 3;

console.log(JSON.stringify(verdict, null, 2));
if (fail) {
  console.error("ENGINE5 FAIL");
  process.exit(1);
}
console.log("ENGINE5 PASS");
await browser.close();

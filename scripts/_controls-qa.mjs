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
document.addEventListener('keydown', e => {
  keys[e.code] = true;

  // Jump
  if (e.code === 'Space' && STATE.canJump) {
    velocity.y = 11.5;
    STATE.canJump = false;
  }

  // Toggle Auto Graphics (key 0)
  if (e.code === 'Digit0' || e.code === 'Numpad0') {
    STATE.autoGraphics = !STATE.autoGraphics;
    updateStatus();
  }

  // Toggle Quantum Live (key 1)
  if (e.code === 'Digit1' || e.code === 'Numpad1') {
    STATE.quantumLive = !STATE.quantumLive;
    updateStatus();
  }

  // ========== M KEY → Open Holographic Atlas ==========
  if (e.code === 'KeyM') {
    // Unlock pointer so the new page can be used normally
    if (controls.isLocked) {
      controls.unlock();
    }

    // Open the Holographic Atlas in the same tab
    // (change to window.open(...) if you prefer a new tab)
    window.location.href = ATLAS_URL;

    // Alternative options (uncomment the one you prefer):

    // Option A – open in new tab
    // window.open(ATLAS_URL, '_blank');

    // Option B – open Extra Maps instead
    // window.location.href = EXTRA_MAPS_URL;

    // Option C – simple choice dialog
    // const choice = confirm('Open Holographic Atlas?\n\nOK = Atlas\nCancel = Extra Maps');
    // window.location.href = choice ? ATLAS_URL : EXTRA_MAPS_URL;
  }
});
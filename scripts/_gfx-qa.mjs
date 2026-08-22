import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("console", (m) => console.log("CONSOLE", m.type(), m.text()));
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);
await page.getByRole("button", { name: /ENTER THE PALACE/i }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: /Deploy/i }).click();
await page.waitForTimeout(6000);
const info = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  let pixel = null;
  if (c) {
    try {
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      pixel = { w: c.width, h: c.height, cw: c.clientWidth, ch: c.clientHeight, gl: Boolean(gl) };
    } catch (e) {
      pixel = String(e);
    }
  }
  return {
    pixel,
    dump: window.__controlsTest?.dump?.() ?? null,
    pos: window.__controlsTest?.getPos?.() ?? null,
  };
});
console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: "/workspace/screenshots/qa-gfx.png" });
await browser.close();

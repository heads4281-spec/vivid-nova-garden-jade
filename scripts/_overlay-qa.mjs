import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(600);
await page.getByRole("button", { name: /ENTER THE PALACE/i }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: /Deploy/i }).click();
await page.waitForTimeout(5500);
const info = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  if (c) {
    c.style.zIndex = "50";
    c.style.outline = "4px solid lime";
  }
  const texts = [...document.querySelectorAll("body *")]
    .filter((el) => el.childNodes.length && [...el.childNodes].every((n) => n.nodeType === 3))
    .map((el) => (el.textContent || "").trim())
    .filter(Boolean)
    .slice(0, 30);
  const overlay = [...document.querySelectorAll("div")].filter((d) => /OPENING THE RIFT|LOADING/.test(d.textContent || "")).map((d) => d.className);
  return {
    texts,
    overlay,
    canvasClass: c?.className,
    canvasZ: c ? getComputedStyle(c).zIndex : null,
    canvasRect: c ? c.getBoundingClientRect() : null,
    dump: window.__controlsTest?.dump?.() ?? null,
  };
});
console.log(JSON.stringify(info, null, 2));
await page.screenshot({ path: "/workspace/screenshots/qa-overlay.png" });
await browser.close();

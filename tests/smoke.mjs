// Smoke e2e for the demo homepage (Playwright from ~/.veon/tools). Usage: node tests/smoke.mjs http://localhost:4322/
import { createRequire } from "node:module";
import os from "node:os";
const require = createRequire(`${os.homedir()}/.veon/tools/package.json`);
const { chromium } = require("playwright");
const url = process.argv[2] || "http://localhost:4322/";
const exe = process.env.CHROME_PATH || "/usr/bin/google-chrome";
const b = await chromium.launch({ executablePath: exe });
const fails = [];
const ok = (c, m) => { console.log(`${c ? "PASS" : "FAIL"} ${m}`); if (!c) fails.push(m); };

for (const w of [320, 375, 390, 768, 1024, 1280, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 } });
  const errs = []; p.on("pageerror", (e) => errs.push(String(e))); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto(url, { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const cw = document.documentElement.clientWidth;
    const out = [...document.querySelectorAll("a, button, h1, h2, h3, p, li, img")].filter((e) => { const b = e.getBoundingClientRect(); return b.width && (b.right > cw + 1 || b.left < -1) && !e.closest(".fp-photo, [aria-hidden=true], dialog, .mobile-menu"); }).map((e) => e.tagName + "." + e.className);
    return { sw: document.documentElement.scrollWidth, cw, out: out.slice(0, 5) };
  });
  ok(r.sw <= r.cw && !r.out.length, `${w}px: no horizontal scroll, nothing outside the screen ${r.out.join(" ")}`);
  ok(!errs.length, `${w}px: no console errors ${errs.join(";")}`);
  await p.close();
}

// Booking dialog: open, real channels, Esc closes, focus returns
for (const [w, sel] of [[1440, ".fp-book"], [390, ".fp-book"]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(url, { waitUntil: "networkidle" });
  await p.click(sel);
  const open = await p.evaluate(() => document.querySelector("dialog")?.open);
  ok(open, `${w}px: «Записатися» opens the channel picker`);
  const hrefs = await p.$$eval("dialog a", (as) => as.map((a) => a.getAttribute("href")));
  ok(hrefs.join() === "tel:+380962140333,viber://chat?number=%2B380682140333,https://t.me/vidnova_clinic_bot", `${w}px: picker channels ${hrefs.join(" ")}`);
  await p.waitForTimeout(450);
  const box = await p.locator("dialog").boundingBox();
  console.log("  dialog box", JSON.stringify(box));
  ok(box && box.x >= 0 && box.x + box.width <= w && box.y >= 0 && box.y + box.height <= 900, `${w}px: picker inside the screen`);
  await p.keyboard.press("Escape");
  const st = await p.evaluate(() => ({ open: document.querySelector("dialog").open, focus: document.activeElement?.className || "" }));
  ok(!st.open && st.focus.includes("fp-book"), `${w}px: Esc closes, focus back on the trigger`);
  await p.close();
}

// Mobile menu + anchors + bottom bar
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await p.goto(url, { waitUntil: "networkidle" });
  ok(!(await p.evaluate(() => document.querySelector("[data-mbar]").classList.contains("is-shown"))), "390px: bottom bar hidden on the first screen");
  await p.click("[data-menu-toggle]");
  ok(await p.isVisible("#mobile-menu"), "390px: menu opens");
  await p.click('#mobile-menu a[href="#doctors"]');
  await p.waitForTimeout(1200);
  const s = await p.evaluate(() => ({ hidden: document.querySelector("#mobile-menu").hidden, top: Math.round(document.getElementById("doctors").getBoundingClientRect().top), bar: document.querySelector("[data-mbar]").classList.contains("is-shown") }));
  ok(s.hidden && s.top >= 0 && s.top < 120, `390px: anchor #doctors reached under the header (top ${s.top}), menu closed`);
  ok(s.bar, "390px: bottom bar shown after the first screen");
  // accordion: one open at a time
  await p.click('[data-dir="dental"] [data-dir-toggle]');
  const acc = await p.$$eval("[data-dir]", (r) => r.filter((x) => x.classList.contains("is-open")).map((x) => x.dataset.dir));
  ok(acc.join() === "dental", `390px: directions accordion keeps one open (${acc})`);
  await p.close();
}

// FutureLink, external links, data-rec, H1, noindex
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(url, { waitUntil: "networkidle" });
  const d = await p.evaluate(() => ({
    fl: [...document.querySelectorAll(".future-link")].every((e) => !e.hasAttribute("href") && e.getAttribute("aria-disabled") === "true"),
    ext: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => !h.startsWith("#")),
    h1: document.querySelectorAll("h1").length === 1 ? document.querySelector("h1").textContent.replace(/\s+/g, " ").trim() : "",
    robots: document.querySelector('meta[name=robots]')?.content,
    recs: [...new Set([...document.querySelectorAll("[data-rec]")].flatMap((e) => e.dataset.rec.split(",")))].sort(),
    ids: [...document.querySelectorAll("main > section")].map((s) => s.id),
  }));
  ok(d.fl, "FutureLink: no href, aria-disabled");
  const allowed = /^(tel:\+380962140333|viber:\/\/chat\?number=%2B380682140333|https:\/\/t\.me\/vidnova_clinic_bot|mailto:vidnova33@gmail\.com|https:\/\/www\.instagram\.com\/vidnova\.ua|https:\/\/www\.youtube\.com\/c\/Vidnova|https:\/\/www\.google\.com\/maps\/search\/.*)$/;
  ok(d.ext.every((h) => allowed.test(h)), `external links only real channels: ${[...new Set(d.ext)].filter((h) => !allowed.test(h)).join(" ")}`);
  ok(d.h1 === "Vidnova Clinic у Львові — пластична хірургія, стоматологія, косметологія і гінекологія", `H1 exact: ${d.h1}`);
  ok(/noindex/.test(d.robots || ""), "noindex");
  ok(d.ids.join() === "hero,directions,one-day,doctors,equipment,trust,contacts", `sections order ${d.ids}`);
  console.log("data-rec:", d.recs.join(" "));
  await p.close();
}

// No JS: content visible, booking leads to #contacts
{
  const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "load" });
  const n = await p.evaluate(() => ({ panels: [...document.querySelectorAll(".dir-panel")].filter((e) => e.offsetHeight > 0).length, formula: getComputedStyle(document.querySelector(".od-total")).opacity, book: document.querySelector(".fp-book").getAttribute("href") }));
  ok(n.panels === 6 && n.formula === "1" && n.book === "#contacts", `no JS: 6 directions open, formula visible, booking → #contacts (${JSON.stringify(n)})`);
  await ctx.close();
}
await b.close();
console.log(fails.length ? `RESULT: FAIL (${fails.length})` : "RESULT: PASS");
process.exit(fails.length ? 1 : 0);

// Vidnova homepage interactions: booking channel picker, mobile menu, sticky header line,
// mobile booking bar, directions index (photo swap on desktop, accordion on phones).
// Everything degrades: without JS, «Записатися» leads to #contacts and all directions are open.

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktop = window.matchMedia("(min-width: 1024px)");
const tabletUp = window.matchMedia("(min-width: 768px)");

/* ---------- Booking channel picker ---------- */
const dialog = document.querySelector<HTMLDialogElement>("[data-book-dialog]");
let lastTrigger: HTMLElement | null = null;

function placeDialog(trigger: HTMLElement) {
  if (!dialog || !tabletUp.matches) return;
  const r = trigger.getBoundingClientRect();
  const w = dialog.offsetWidth || 416;
  const h = dialog.offsetHeight || 320;
  const margin = 16;
  let x = Math.min(Math.max(margin, r.right - w), window.innerWidth - w - margin);
  if (r.left + w < window.innerWidth - margin) x = Math.max(margin, r.left);
  let y = r.bottom + 8;
  if (y + h > window.innerHeight - margin) y = Math.max(margin, r.top - h - 8);
  dialog.style.setProperty("--book-x", `${Math.round(x)}px`);
  dialog.style.setProperty("--book-y", `${Math.round(y)}px`);
}

function openBook(trigger: HTMLElement) {
  if (!dialog || typeof dialog.showModal !== "function") return false;
  lastTrigger = trigger;
  closeMenu(false);
  dialog.showModal();
  placeDialog(trigger);
  dialog.querySelector<HTMLElement>(".book__item")?.focus();
  return true;
}

document.querySelectorAll<HTMLElement>("[data-book]").forEach((el) => {
  el.addEventListener("click", (e) => {
    if (openBook(el)) e.preventDefault();
  });
});
dialog?.querySelector("[data-book-close]")?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("click", (e) => {
  if (e.target === dialog) {
    // click on the backdrop area outside the panel
    const r = dialog.getBoundingClientRect();
    const { clientX: x, clientY: y } = e;
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) dialog.close();
  }
});
dialog?.addEventListener("close", () => {
  lastTrigger?.focus({ preventScroll: true });
});
window.addEventListener("resize", () => {
  if (dialog?.open && lastTrigger) placeDialog(lastTrigger);
});

/* ---------- Mobile menu ---------- */
const header = document.querySelector<HTMLElement>("[data-header]");
const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const menu = document.querySelector<HTMLElement>("[data-menu]");

function closeMenu(returnFocus = true) {
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  toggle?.setAttribute("aria-expanded", "false");
  header?.classList.remove("menu-open");
  if (returnFocus) toggle?.focus();
}
toggle?.addEventListener("click", () => {
  if (!menu) return;
  const open = menu.hidden;
  menu.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  header?.classList.toggle("menu-open", open);
  if (open) menu.querySelector<HTMLElement>("a")?.focus();
});
menu?.querySelectorAll("[data-menu-close]").forEach((a) => a.addEventListener("click", () => closeMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});
desktop.addEventListener("change", () => closeMenu(false));

/* ---------- Header line after scroll + mobile bar after the first screen ---------- */
const hero = document.getElementById("hero");
const bar = document.querySelector<HTMLElement>("[data-mbar]");
if ("IntersectionObserver" in window && hero) {
  const io = new IntersectionObserver(([entry]) => {
    const past = !entry.isIntersecting;
    bar?.classList.toggle("is-shown", past);
  }, { threshold: 0 });
  const heroAction = hero.querySelector(".fp-action");
  if (heroAction) io.observe(heroAction);
} else {
  bar?.classList.add("is-shown");
}
const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Directions index ---------- */
const index = document.querySelector<HTMLElement>("[data-dir-index]");
if (index) {
  const rows = Array.from(index.querySelectorAll<HTMLElement>("[data-dir]"));
  const frames = Array.from(document.querySelectorAll<HTMLElement>("[data-dir-frame]"));

  const setActive = (key: string) => {
    rows.forEach((r) => r.classList.toggle("is-active", r.dataset.dir === key));
    frames.forEach((f) => f.classList.toggle("is-active", f.dataset.dirFrame === key));
  };

  const setOpen = (row: HTMLElement, open: boolean) => {
    row.classList.toggle("is-open", open);
    row.querySelector("[data-dir-toggle]")?.setAttribute("aria-expanded", String(open));
  };

  const applyMode = () => {
    if (desktop.matches) {
      rows.forEach((r) => setOpen(r, true));
    } else {
      rows.forEach((r) => setOpen(r, false));
    }
  };

  rows.forEach((row) => {
    const key = row.dataset.dir ?? "";
    row.addEventListener("mouseenter", () => { if (desktop.matches) setActive(key); });
    row.addEventListener("focusin", () => { if (desktop.matches) setActive(key); });
    row.querySelector("[data-dir-toggle]")?.addEventListener("click", () => {
      if (desktop.matches) { setActive(key); return; }
      const willOpen = !row.classList.contains("is-open");
      rows.forEach((r) => setOpen(r, r === row ? willOpen : false));
      if (willOpen && !reduce.matches) {
        const top = row.getBoundingClientRect().top;
        if (top < 0) row.scrollIntoView({ block: "start" });
      }
    });
  });

  index.classList.add("is-enhanced");
  setActive(rows[0]?.dataset.dir ?? "");
  applyMode();
  desktop.addEventListener("change", applyMode);
}

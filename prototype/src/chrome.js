import { getLang, setLang, t, pages } from "./i18n.js";

function currentPageId() {
  const file = location.pathname.split("/").pop() || "index.html";
  if (file === "" || file === "index.html") return "home";
  return file.replace(".html", "");
}

const logoImg = `
  <img
    class="brand-logo"
    src="/brand/nuttyfelt-logo.png"
    alt="nuttyfelt"
    width="280"
    height="60"
  />
`;

export function mountChrome() {
  const lang = getLang();
  const c = t(lang);
  const page = currentPageId();
  const header = document.querySelector("[data-header]");
  const footer = document.querySelector("[data-footer]");
  if (!header || !footer) return;

  header.innerHTML = `
    <div class="site-header border-b border-line/70 bg-paper/90 backdrop-blur-sm">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-10 md:py-4 lg:px-16">
        <a href="/index.html" class="shrink-0" data-brand aria-label="nuttyfelt home">${logoImg}</a>
        <div class="flex items-center gap-3 md:gap-4">
          <button type="button" class="font-ui text-sm text-ink-muted hover:text-ink" data-lang-toggle aria-label="Switch language">
            ${c.otherLang}
          </button>
          <a href="/commission.html" class="btn-primary !px-3 !py-2 text-xs md:!px-4 md:text-sm" data-i18n="nav.commission">${c.nav.commission}</a>
          <button type="button" class="font-ui text-sm text-ink md:hidden" data-menu-open aria-expanded="false">${c.menu}</button>
          <nav class="hidden items-center gap-5 md:flex" aria-label="Primary">
            ${navLinks(c, page, false)}
          </nav>
        </div>
      </div>
    </div>
    <div class="fixed inset-0 z-40 hidden bg-paper/98 md:hidden" data-menu hidden>
      <div class="flex h-full flex-col">
        <div class="flex items-center justify-between border-b border-line/70 px-5 py-3">
          <span class="sr-only">nuttyfelt</span>
          ${logoImg}
          <button type="button" class="font-ui text-sm text-ink" data-menu-close>${c.close}</button>
        </div>
        <nav class="flex flex-col gap-5 px-5 py-8" aria-label="Mobile">
          ${navLinks(c, page, true)}
        </nav>
      </div>
    </div>
  `;

  footer.innerHTML = `
    <div class="border-t border-line/80">
      <div class="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.2fr_1fr_1fr] md:px-10 lg:px-16">
        <div>
          <a href="/index.html" aria-label="nuttyfelt home">${logoImg}</a>
          <p class="mt-3 font-ui text-sm text-ink-muted">${c.footerTag}</p>
        </div>
        <div>
          <p class="font-ui text-xs uppercase tracking-[0.16em] text-brass-deep">Nav</p>
          <ul class="mt-4 space-y-2 font-ui text-sm">
            ${pages
              .map((p) => {
                const key = p.id === "process" ? "process" : p.id;
                return `<li><a class="text-ink-muted hover:text-ink" href="${p.href}">${c.nav[key]}</a></li>`;
              })
              .join("")}
          </ul>
        </div>
        <div>
          <p class="font-ui text-xs uppercase tracking-[0.16em] text-brass-deep">${c.footerSocial}</p>
          <ul class="mt-4 space-y-2 font-ui text-sm">
            <li><a class="text-ink-muted hover:text-ink" href="https://instagram.com" rel="noopener noreferrer" target="_blank">${c.instagram}</a></li>
            <li><a class="text-ink-muted hover:text-ink" href="https://threads.net" rel="noopener noreferrer" target="_blank">${c.threads}</a></li>
            <li><button type="button" class="text-ink-muted hover:text-ink" data-lang-toggle>${c.otherLang}</button></li>
          </ul>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll("[data-lang-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setLang(lang === "en" ? "zh-Hant" : "en");
      location.reload();
    });
  });

  const menu = header.querySelector("[data-menu]");
  const openBtn = header.querySelector("[data-menu-open]");
  const closeBtn = header.querySelector("[data-menu-close]");
  openBtn?.addEventListener("click", () => {
    menu.hidden = false;
    menu.classList.remove("hidden");
    openBtn.setAttribute("aria-expanded", "true");
  });
  closeBtn?.addEventListener("click", () => {
    menu.hidden = true;
    menu.classList.add("hidden");
    openBtn.setAttribute("aria-expanded", "false");
  });
}

function navLinks(c, page, mobile) {
  return pages
    .filter((p) => p.id !== "commission" || mobile)
    .map((p) => {
      const key = p.id;
      const label = c.nav[key];
      const current = page === p.id ? ' aria-current="page"' : "";
      const cls = mobile
        ? "font-display text-2xl text-ink"
        : `nav-link${page === p.id ? " text-ink" : ""}`;
      return `<a class="${cls}" href="${p.href}"${current}>${label}</a>`;
    })
    .join("");
}

export function applyPageCopy(map) {
  const lang = getLang();
  const c = t(lang);
  document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";
  document.querySelectorAll("[data-copy]").forEach((el) => {
    const path = el.getAttribute("data-copy");
    const value = path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), c);
    if (typeof value === "string") el.textContent = value;
  });
  if (map?.title) document.title = map.title(c);
}

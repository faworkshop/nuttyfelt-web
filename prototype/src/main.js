import "./styles.css";
import { mountChrome, applyPageCopy } from "./chrome.js";
import { getLang, setLang } from "./i18n.js";

setLang(getLang());
mountChrome();
applyPageCopy({
  title: (c) => {
    const page = document.body.dataset.page;
    if (page === "home") return `nuttyfelt`;
    const titles = {
      works: c.works.title,
      halo: c.halo.title,
      process: c.process.title,
      about: c.about.title,
      faq: c.faq.title,
      commission: c.commission.title,
    };
    return `${titles[page] || "nuttyfelt"} · nuttyfelt`;
  },
});

const stagger = document.querySelector("[data-stagger]");
if (stagger) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );
  io.observe(stagger);
}

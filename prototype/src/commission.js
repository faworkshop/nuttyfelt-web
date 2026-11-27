import "./main.js";
import { getLang, t } from "./i18n.js";

const form = document.querySelector("[data-commission-form]");
const success = document.querySelector("[data-success]");
const locationSelect = document.querySelector("[data-location]");
const countryField = document.querySelector("[data-country-field]");

locationSelect?.addEventListener("change", () => {
  const other = locationSelect.value === "other";
  countryField.hidden = !other;
  countryField.querySelector("input").required = other;
});

document.querySelectorAll("[data-upload]").forEach((root) => {
  const input = root.querySelector('input[type="file"]');
  const list = root.querySelector("[data-file-list]");
  const c = t(getLang()).commission;

  input?.addEventListener("change", () => {
    const files = [...(input.files || [])].slice(0, 10);
    list.innerHTML = "";
    files.forEach((file, index) => {
      const row = document.createElement("div");
      row.className =
        "flex items-center justify-between gap-3 border-b border-line/70 py-3 font-ui text-sm";
      row.innerHTML = `
        <div class="min-w-0">
          <p class="truncate text-ink">${file.name}</p>
          <p class="text-xs text-ink-muted">${(file.size / (1024 * 1024)).toFixed(1)} MB</p>
          <div class="mt-2 h-1 overflow-hidden rounded bg-mist">
            <div class="h-full w-0 bg-brass transition-all duration-700" data-bar></div>
          </div>
        </div>
        <button type="button" class="shrink-0 text-ink-muted hover:text-danger" data-remove>${c.remove}</button>
      `;
      list.appendChild(row);
      requestAnimationFrame(() => {
        row.querySelector("[data-bar]").style.width = "100%";
      });
      row.querySelector("[data-remove]")?.addEventListener("click", () => {
        row.remove();
        if (![...list.children].length) input.value = "";
      });
      void index;
    });
  });
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const c = t(getLang()).commission;
  const submitBtn = form.querySelector('[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = c.uploading;

  await new Promise((r) => setTimeout(r, 900));

  form.hidden = true;
  success.hidden = false;
  success.scrollIntoView({ behavior: "smooth", block: "start" });
});

import "./main.js";
import { getLang, t } from "./i18n.js";

const TOTAL_STEPS = 4;
const STEP_TITLES = [
  "sectionContact",
  "sectionCat",
  "sectionPhotos",
  "stepConfirm",
];

const form = document.querySelector("[data-commission-form]");
const success = document.querySelector("[data-success]");
const locationSelect = document.querySelector("[data-location]");
const countryField = document.querySelector("[data-country-field]");
const backBtn = document.querySelector("[data-step-back]");
const nextBtn = document.querySelector("[data-step-next]");
const submitBtn = document.querySelector("[data-step-submit]");
const currentEl = document.querySelector("[data-step-current]");
const titleEl = document.querySelector("[data-step-title]");

let step = 1;

locationSelect?.addEventListener("change", () => {
  const other = locationSelect.value === "other";
  countryField.hidden = !other;
  countryField.querySelector("input").required = other;
});

document.querySelectorAll("[data-upload]").forEach((root) => {
  const input = root.querySelector('input[type="file"]');
  const list = root.querySelector("[data-file-list]");
  const c = t(getLang()).commission;
  const photoError = root.querySelector("[data-photo-error]");

  input?.addEventListener("change", () => {
    const files = [...(input.files || [])].slice(0, 10);
    list.innerHTML = "";
    if (photoError) photoError.classList.add("hidden");
    files.forEach((file) => {
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
    });
  });
});

function panel(n) {
  return form.querySelector(`[data-step-panel="${n}"]`);
}

function validateStep(n) {
  const current = panel(n);
  if (!current) return false;

  const fields = [...current.querySelectorAll("input, select, textarea")].filter(
    (el) => el.type !== "file" && !el.disabled,
  );

  for (const el of fields) {
    if (!el.checkValidity()) {
      el.reportValidity();
      el.focus();
      return false;
    }
  }

  if (n === 3) {
    const requiredPhotos = current.querySelector("[data-required-photos]");
    const photoError = current.querySelector("[data-photo-error]");
    if (requiredPhotos && !(requiredPhotos.files && requiredPhotos.files.length)) {
      photoError?.classList.remove("hidden");
      requiredPhotos.focus();
      return false;
    }
  }

  return true;
}

function renderStep() {
  const c = t(getLang()).commission;

  for (let i = 1; i <= TOTAL_STEPS; i += 1) {
    const p = panel(i);
    if (p) p.hidden = i !== step;
    const indicator = form.querySelector(`[data-step-indicator="${i}"]`);
    if (indicator) {
      indicator.classList.toggle("is-active", i === step);
      indicator.classList.toggle("is-done", i < step);
    }
  }

  if (currentEl) currentEl.textContent = String(step);
  if (titleEl) {
    titleEl.textContent = c[STEP_TITLES[step - 1]] || "";
    titleEl.setAttribute("data-copy", `commission.${STEP_TITLES[step - 1]}`);
  }

  if (backBtn) backBtn.hidden = step === 1;
  if (nextBtn) nextBtn.classList.toggle("hidden", step === TOTAL_STEPS);
  if (submitBtn) submitBtn.classList.toggle("hidden", step !== TOTAL_STEPS);

  panel(step)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

backBtn?.addEventListener("click", () => {
  if (step > 1) {
    step -= 1;
    renderStep();
  }
});

nextBtn?.addEventListener("click", () => {
  if (!validateStep(step)) return;
  if (step < TOTAL_STEPS) {
    step += 1;
    renderStep();
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateStep(step)) return;

  const c = t(getLang()).commission;
  submitBtn.disabled = true;
  submitBtn.textContent = c.uploading;
  nextBtn.disabled = true;
  backBtn.disabled = true;

  await new Promise((r) => setTimeout(r, 900));

  form.hidden = true;
  success.hidden = false;
  success.scrollIntoView({ behavior: "smooth", block: "start" });
});

renderStep();

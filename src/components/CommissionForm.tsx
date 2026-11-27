"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { Link } from "@/i18n/navigation";

const TOTAL_STEPS = 4;

export function CommissionForm() {
  const t = useTranslations("commission");
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [location, setLocation] = useState("hk");
  const [basicCount, setBasicCount] = useState(0);
  const [photoError, setPhotoError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const titles = [
    t("sectionContact"),
    t("sectionCat"),
    t("sectionPhotos"),
    t("stepConfirm"),
  ];

  function validateStep(n: number, form: HTMLFormElement) {
    const panel = form.querySelector<HTMLElement>(`[data-step-panel="${n}"]`);
    if (!panel) return false;
    const fields = [...panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea",
    )].filter((el) => el.type !== "file" && !el.disabled);

    for (const el of fields) {
      if (!el.checkValidity()) {
        el.reportValidity();
        el.focus();
        return false;
      }
    }

    if (n === 3 && basicCount < 1) {
      setPhotoError(true);
      return false;
    }
    setPhotoError(false);
    return true;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateStep(step, form)) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-md border border-line bg-wool px-5 py-10">
        <h2 className="font-display text-2xl">{t("successTitle")}</h2>
        <p className="mt-4 leading-relaxed text-ink-muted">{t("successBody")}</p>
        <p className="mt-4 font-ui text-sm text-ink-muted">{t("successNote")}</p>
        <Link href="/" className="btn-secondary mt-8">
          nuttyfelt
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-8" noValidate onSubmit={onSubmit}>
      <div className="stepper" aria-label="Form progress">
        <ol className="grid grid-cols-4 gap-2">
          {[t("stepContact"), t("stepCat"), t("stepPhotos"), t("stepConfirm")].map(
            (label, index) => {
              const n = index + 1;
              return (
                <li
                  key={label}
                  className={`stepper-item${n === step ? " is-active" : ""}${n < step ? " is-done" : ""}`}
                >
                  <span className="stepper-num">{n}</span>
                  <span className="stepper-label">{label}</span>
                </li>
              );
            },
          )}
        </ol>
        <p className="mt-3 font-ui text-sm text-ink-muted">
          {t("stepOfPrefix")} {step}
          {t("stepOfMid")}
          {TOTAL_STEPS}
          <span className="mx-2 text-line">·</span>
          {titles[step - 1]}
        </p>
      </div>

      <fieldset className="space-y-5" data-step-panel="1" hidden={step !== 1}>
        <div className="field">
          <label htmlFor="email">{t("email")}</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="name">{t("name")}</label>
          <input id="name" name="name" type="text" required autoComplete="nickname" />
        </div>
        <div className="field">
          <label htmlFor="instagram">{t("instagram")}</label>
          <input id="instagram" name="instagram" type="text" required placeholder="@" />
        </div>
        <div className="field">
          <label htmlFor="whatsapp">{t("whatsapp")}</label>
          <input id="whatsapp" name="whatsapp" type="text" required />
        </div>
        <div className="field">
          <label htmlFor="location">{t("location")}</label>
          <select
            id="location"
            name="location"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="hk">{t("locationHk")}</option>
            <option value="other">{t("locationOther")}</option>
          </select>
        </div>
        {location === "other" ? (
          <div className="field">
            <label htmlFor="country">{t("country")}</label>
            <input id="country" name="country" type="text" required />
          </div>
        ) : null}
      </fieldset>

      <fieldset className="space-y-5" data-step-panel="2" hidden={step !== 2}>
        <div className="field">
          <label htmlFor="catName">{t("catName")}</label>
          <input id="catName" name="catName" type="text" required />
        </div>
        <div className="field">
          <label htmlFor="coat">{t("coat")}</label>
          <select id="coat" name="coat" required defaultValue="short">
            <option value="short">{t("coatShort")}</option>
            <option value="long">{t("coatLong")}</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="features">{t("features")}</label>
          <textarea id="features" name="features" rows={4} required />
        </div>
        <div className="field">
          <label htmlFor="found">{t("found")}</label>
          <select id="found" name="found" defaultValue="">
            <option value="">—</option>
            <option value="ig">Instagram</option>
            <option value="threads">Threads</option>
            <option value="friend">Friend</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="breed">{t("breed")}</label>
          <input id="breed" name="breed" type="text" />
        </div>
        <div className="field">
          <label htmlFor="hopeDate">{t("hopeDate")}</label>
          <input id="hopeDate" name="hopeDate" type="text" />
        </div>
        <div className="field">
          <label htmlFor="stories">{t("stories")}</label>
          <textarea id="stories" name="stories" rows={3} />
        </div>
      </fieldset>

      <fieldset className="space-y-8" data-step-panel="3" hidden={step !== 3}>
        <div className="rounded-md border border-line bg-wool p-4">
          <div className="field">
            <label htmlFor="photosBasic">{t("photosBasic")}</label>
            <p className="hint">{t("photosBasicHint")}</p>
            <input
              id="photosBasic"
              name="photosBasic"
              className="mt-2 font-ui text-sm"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                setBasicCount(e.target.files?.length ?? 0);
                setPhotoError(false);
              }}
            />
          </div>
          {photoError ? (
            <p className="mt-2 font-ui text-xs text-danger">{t("photosRequired")}</p>
          ) : null}
        </div>
        <div className="rounded-md border border-line bg-wool p-4">
          <div className="field">
            <label htmlFor="photosExtra">{t("photosExtra")}</label>
            <p className="hint">{t("photosExtraHint")}</p>
            <input
              id="photosExtra"
              name="photosExtra"
              className="mt-2 font-ui text-sm"
              type="file"
              accept="image/*"
              multiple
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-8" data-step-panel="4" hidden={step !== 4}>
        <div className="space-y-5">
          <h2 className="font-display text-xl">{t("sectionStatus")}</h2>
          <div className="field">
            <label htmlFor="status">{t("statusLabel")}</label>
            <select id="status" name="status" defaultValue="">
              <option value="">—</option>
              <option value="with">{t("statusWith")}</option>
              <option value="passed">{t("statusPassed")}</option>
              <option value="skip">{t("statusSkip")}</option>
            </select>
            <p className="hint">{t("statusHint")}</p>
          </div>
        </div>
        <div className="space-y-5 border-t border-line pt-8">
          <h2 className="font-display text-xl">{t("sectionConsents")}</h2>
          <label className="flex items-start gap-3 font-ui text-sm leading-relaxed">
            <input className="mt-1" type="checkbox" name="terms" required />
            <span>{t("agreeTerms")}</span>
          </label>
          <label className="flex items-start gap-3 font-ui text-sm leading-relaxed">
            <input className="mt-1" type="checkbox" name="handmade" required />
            <span>{t("agreeHandmade")}</span>
          </label>
          <div className="field">
            <p className="font-ui text-sm font-medium">{t("publicity")}</p>
            <label className="mt-3 flex items-start gap-3 font-ui text-sm">
              <input className="mt-1" type="radio" name="publicity" value="tag" required />
              <span>{t("tagOk")}</span>
            </label>
            <label className="mt-3 flex items-start gap-3 font-ui text-sm">
              <input className="mt-1" type="radio" name="publicity" value="no-tag" required />
              <span>{t("tagNo")}</span>
            </label>
          </div>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        {step > 1 ? (
          <button
            className="btn-secondary"
            type="button"
            onClick={() => setStep((s) => s - 1)}
          >
            {t("back")}
          </button>
        ) : null}
        {step < TOTAL_STEPS ? (
          <button
            className="btn-primary ml-auto"
            type="button"
            onClick={(e) => {
              const form = e.currentTarget.form;
              if (!form) return;
              if (validateStep(step, form)) setStep((s) => s + 1);
            }}
          >
            {t("next")}
          </button>
        ) : (
          <button className="btn-primary ml-auto" type="submit" disabled={submitting}>
            {submitting ? t("uploading") : t("submit")}
          </button>
        )}
      </div>
    </form>
  );
}

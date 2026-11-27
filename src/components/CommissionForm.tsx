"use client";

import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useId, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { uploadFileToR2 } from "@/lib/client-upload";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILES_PER_GROUP,
  MAX_UPLOAD_BYTES,
  isAllowedImageType,
  type UploadGroup,
} from "@/lib/uploads";

const TOTAL_STEPS = 4;

const ACCEPT_IMAGES = ALLOWED_IMAGE_TYPES.join(",");

type FileStatus = "queued" | "uploading" | "done" | "error";

type TrackedFile = {
  id: string;
  file: File;
  group: UploadGroup;
  status: FileStatus;
  progress: number;
  storageKey?: string;
  error?: string;
};

function formatMb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function newFileId() {
  return crypto.randomUUID();
}

export function CommissionForm() {
  const t = useTranslations("commission");
  const locale = useLocale();
  // Defer UUID until interaction so prerender does not call crypto.randomUUID().
  const uploadSessionIdRef = useRef<string | null>(null);
  const basicInputId = useId();
  const extraInputId = useId();

  function getUploadSessionId() {
    if (!uploadSessionIdRef.current) {
      uploadSessionIdRef.current = crypto.randomUUID();
    }
    return uploadSessionIdRef.current;
  }

  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [requestRef, setRequestRef] = useState<string | null>(null);
  const [location, setLocation] = useState("hk");
  const [files, setFiles] = useState<TrackedFile[]>([]);
  const [photoError, setPhotoError] = useState(false);
  const [fileMessage, setFileMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const basicFiles = files.filter((f) => f.group === "basic");
  const extraFiles = files.filter((f) => f.group === "extra");

  const titles = [
    t("sectionContact"),
    t("sectionCat"),
    t("sectionPhotos"),
    t("stepConfirm"),
  ];

  function updateFile(id: string, patch: Partial<TrackedFile>) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setPhotoError(false);
    setFileMessage(null);
  }

  function addFiles(group: UploadGroup, list: FileList | null) {
    if (!list?.length) return;

    const existing = files.filter((f) => f.group === group);
    const room = MAX_FILES_PER_GROUP - existing.length;
    if (room <= 0) {
      setFileMessage(t("tooManyFiles"));
      return;
    }

    const incoming = [...list];
    const accepted: TrackedFile[] = [];
    let message: string | null = null;

    for (const file of incoming) {
      if (accepted.length >= room) {
        message = t("tooManyFiles");
        break;
      }
      if (!file.type || !isAllowedImageType(file.type)) {
        message = t("unsupportedType");
        continue;
      }
      if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
        message = t("fileTooLarge");
        continue;
      }
      accepted.push({
        id: newFileId(),
        file,
        group,
        status: "queued",
        progress: 0,
      });
    }

    if (accepted.length) {
      setFiles((prev) => [...prev, ...accepted]);
      setPhotoError(false);
    }
    setFileMessage(message);
  }

  function validateStep(n: number, form: HTMLFormElement) {
    const panel = form.querySelector<HTMLElement>(`[data-step-panel="${n}"]`);
    if (!panel) return false;
    const fields = [
      ...panel.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("input, select, textarea"),
    ].filter((el) => el.type !== "file" && !el.disabled);

    for (const el of fields) {
      if (!el.checkValidity()) {
        el.reportValidity();
        el.focus();
        return false;
      }
    }

    if (n === 3 && basicFiles.length < 1) {
      setPhotoError(true);
      return false;
    }
    setPhotoError(false);
    return true;
  }

  async function uploadTrackedFile(
    item: TrackedFile,
  ): Promise<{ storageKey: string } | null> {
    if (item.status === "done" && item.storageKey) {
      return { storageKey: item.storageKey };
    }

    updateFile(item.id, { status: "uploading", progress: 0, error: undefined });
    try {
      const { storageKey } = await uploadFileToR2(item.file, {
        group: item.group,
        uploadSessionId: getUploadSessionId(),
        onProgress: (ratio) => updateFile(item.id, { progress: ratio }),
      });
      updateFile(item.id, {
        status: "done",
        progress: 1,
        storageKey,
        error: undefined,
      });
      return { storageKey };
    } catch {
      updateFile(item.id, {
        status: "error",
        error: t("uploadFailed"),
      });
      return null;
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateStep(step, form)) return;

    setSubmitting(true);
    setSubmitError(null);

    const uploaded: {
      group: UploadGroup;
      storageKey: string;
      originalFilename: string;
      sizeBytes: number;
      contentType: string;
    }[] = [];

    for (const item of files) {
      const result = await uploadTrackedFile(item);
      if (!result) {
        setSubmitting(false);
        setSubmitError(t("uploadFailed"));
        return;
      }
      uploaded.push({
        group: item.group,
        storageKey: result.storageKey,
        originalFilename: item.file.name,
        sizeBytes: item.file.size,
        contentType: item.file.type,
      });
    }

    const data = new FormData(form);
    const livingRaw = String(data.get("status") ?? "").trim();
    const payload = {
      locale,
      email: String(data.get("email") ?? "").trim(),
      displayName: String(data.get("name") ?? "").trim(),
      instagram: String(data.get("instagram") ?? "").trim(),
      whatsapp: String(data.get("whatsapp") ?? "").trim(),
      location: String(data.get("location") ?? "").trim(),
      country: String(data.get("country") ?? "").trim() || null,
      catName: String(data.get("catName") ?? "").trim(),
      coatLength: String(data.get("coat") ?? "").trim(),
      features: String(data.get("features") ?? "").trim(),
      foundVia: String(data.get("found") ?? "").trim() || null,
      sexBreed: String(data.get("breed") ?? "").trim() || null,
      hopeDate: String(data.get("hopeDate") ?? "").trim() || null,
      stories: String(data.get("stories") ?? "").trim() || null,
      livingStatus: livingRaw || null,
      agreedTerms: data.get("terms") === "on",
      agreedHandmade: data.get("handmade") === "on",
      publicity: String(data.get("publicity") ?? "").trim(),
      uploadSessionId: getUploadSessionId(),
      files: uploaded,
    };

    try {
      const response = await fetch("/api/commission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
        requestId?: string;
        referenceNo?: string;
      };

      if (!response.ok) {
        setSubmitting(false);
        setSubmitError(result.error || t("submitFailed"));
        return;
      }

      setRequestRef(result.referenceNo ?? null);
      setDone(true);
    } catch {
      setSubmitError(t("submitFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  function renderFileList(group: UploadGroup) {
    const list = group === "basic" ? basicFiles : extraFiles;
    if (!list.length) return null;

    return (
      <div className="mt-3 space-y-0">
        {list.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 border-b border-line/70 py-3 font-ui text-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-ink">{item.file.name}</p>
              <p className="text-xs text-ink-muted">{formatMb(item.file.size)}</p>
              {item.status === "uploading" || item.status === "done" ? (
                <div className="mt-2 h-1 overflow-hidden rounded bg-mist">
                  <div
                    className="h-full bg-brass transition-all duration-300"
                    style={{ width: `${Math.round(item.progress * 100)}%` }}
                  />
                </div>
              ) : null}
              {item.status === "error" ? (
                <p className="mt-1 text-xs text-danger">
                  {item.error || t("uploadFailed")}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {item.status === "error" && !submitting ? (
                <button
                  type="button"
                  className="text-ink-muted hover:text-ink"
                  onClick={() => {
                    void uploadTrackedFile(item).then((result) => {
                      if (!result) setSubmitError(t("uploadFailed"));
                      else setSubmitError(null);
                    });
                  }}
                >
                  {t("retry")}
                </button>
              ) : null}
              {!submitting && item.status !== "uploading" ? (
                <button
                  type="button"
                  className="text-ink-muted hover:text-danger"
                  onClick={() => removeFile(item.id)}
                >
                  {t("remove")}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-md border border-line bg-wool px-5 py-10">
        <h2 className="font-display text-2xl">{t("successTitle")}</h2>
        <p className="mt-4 leading-relaxed text-ink-muted">{t("successBody")}</p>
        {requestRef ? (
          <p className="mt-6 font-ui text-sm text-ink">
            <span className="text-ink-muted">{t("successRef")}</span>
            <span className="mt-1 block font-mono text-xl tracking-wide">
              {requestRef}
            </span>
          </p>
        ) : null}
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
            <label htmlFor={basicInputId}>{t("photosBasic")}</label>
            <p className="hint">{t("photosBasicHint")}</p>
            <input
              id={basicInputId}
              className="mt-2 font-ui text-sm"
              type="file"
              accept={ACCEPT_IMAGES}
              multiple
              disabled={submitting}
              onChange={(e) => {
                addFiles("basic", e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          {renderFileList("basic")}
          {photoError ? (
            <p className="mt-2 font-ui text-xs text-danger">{t("photosRequired")}</p>
          ) : null}
        </div>
        <div className="rounded-md border border-line bg-wool p-4">
          <div className="field">
            <label htmlFor={extraInputId}>{t("photosExtra")}</label>
            <p className="hint">{t("photosExtraHint")}</p>
            <input
              id={extraInputId}
              className="mt-2 font-ui text-sm"
              type="file"
              accept={ACCEPT_IMAGES}
              multiple
              disabled={submitting}
              onChange={(e) => {
                addFiles("extra", e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          {renderFileList("extra")}
        </div>
        {fileMessage ? (
          <p className="font-ui text-xs text-danger">{fileMessage}</p>
        ) : null}
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
        {(submitting || submitError) && files.length > 0 ? (
          <div className="space-y-0 border-t border-line pt-6">
            <p className="mb-2 font-ui text-sm text-ink-muted">
              {submitting ? t("uploading") : t("uploadFailed")}
            </p>
            {files.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-line/70 py-3 font-ui text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-ink">{item.file.name}</p>
                  {(item.status === "uploading" || item.status === "done") && (
                    <div className="mt-2 h-1 overflow-hidden rounded bg-mist">
                      <div
                        className="h-full bg-brass transition-all duration-300"
                        style={{ width: `${Math.round(item.progress * 100)}%` }}
                      />
                    </div>
                  )}
                  {item.status === "error" ? (
                    <p className="mt-1 text-xs text-danger">
                      {item.error || t("uploadFailed")}
                    </p>
                  ) : null}
                </div>
                {item.status === "error" && !submitting ? (
                  <button
                    type="button"
                    className="shrink-0 text-ink-muted hover:text-ink"
                    onClick={() => {
                      void uploadTrackedFile(item).then((result) => {
                        if (!result) setSubmitError(t("uploadFailed"));
                        else setSubmitError(null);
                      });
                    }}
                  >
                    {t("retry")}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        {submitError ? (
          <p className="font-ui text-sm text-danger">{submitError}</p>
        ) : null}
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        {step > 1 ? (
          <button
            className="btn-secondary"
            type="button"
            disabled={submitting}
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

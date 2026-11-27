import { Resend } from "resend";
import { getResendEnv } from "./env";

let client: Resend | null = null;

function getResend() {
  if (!client) {
    client = new Resend(getResendEnv().apiKey);
  }
  return client;
}

export type NotifyFileLink = {
  group: string;
  filename: string;
  url: string;
  sizeBytes: number;
};

export type NotifyPayload = {
  requestId: string;
  locale: string;
  email: string;
  displayName: string;
  instagram: string;
  whatsapp: string;
  location: string;
  country: string | null;
  catName: string;
  coatLength: string;
  features: string;
  foundVia: string | null;
  sexBreed: string | null;
  hopeDate: string | null;
  stories: string | null;
  livingStatus: string | null;
  publicity: string;
  files: NotifyFileLink[];
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function row(label: string, value: string | null | undefined) {
  if (!value) return "";
  return `<tr><td style="padding:4px 12px 4px 0;vertical-align:top;color:#666">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`;
}

export async function sendStudioNotification(payload: NotifyPayload) {
  const { notifyEmail, emailFrom } = getResendEnv();
  const basic = payload.files.filter((f) => f.group === "basic");
  const extra = payload.files.filter((f) => f.group === "extra");

  const fileList = (items: NotifyFileLink[]) =>
    items
      .map(
        (f) =>
          `<li><a href="${escapeHtml(f.url)}">${escapeHtml(f.filename)}</a> (${(f.sizeBytes / (1024 * 1024)).toFixed(1)} MB)</li>`,
      )
      .join("");

  const html = `
    <h2>New commission request</h2>
    <p>Request ID: <code>${escapeHtml(payload.requestId)}</code> · Locale: ${escapeHtml(payload.locale)}</p>
    <table>
      ${row("Email", payload.email)}
      ${row("Name", payload.displayName)}
      ${row("Instagram", payload.instagram)}
      ${row("WhatsApp", payload.whatsapp)}
      ${row("Location", payload.location === "hk" ? "Hong Kong" : payload.country || "Other")}
      ${row("Cat", payload.catName)}
      ${row("Coat", payload.coatLength)}
      ${row("Features", payload.features)}
      ${row("Found via", payload.foundVia)}
      ${row("Sex / breed", payload.sexBreed)}
      ${row("Hope date", payload.hopeDate)}
      ${row("Stories", payload.stories)}
      ${row("Living status", payload.livingStatus)}
      ${row("Publicity", payload.publicity)}
    </table>
    <h3>Basic photos (${basic.length})</h3>
    <ul>${fileList(basic) || "<li>None</li>"}</ul>
    <h3>Extra photos (${extra.length})</h3>
    <ul>${fileList(extra) || "<li>None</li>"}</ul>
    <p style="color:#666;font-size:12px">Download links expire in 7 days.</p>
  `;

  const result = await getResend().emails.send({
    from: `nuttyfelt <${emailFrom}>`,
    to: [notifyEmail],
    replyTo: payload.email,
    subject: `Commission request — ${payload.catName} (${payload.displayName})`,
    html,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data?.id ?? null;
}

export async function sendClientConfirmation(input: {
  email: string;
  displayName: string;
  catName: string;
  locale: string;
}) {
  const { emailFrom } = getResendEnv();
  const zh = input.locale === "zh-Hant";

  const subject = zh
    ? `已收到你的 nuttyfelt 訂製申請（${input.catName}）`
    : `We received your nuttyfelt commission request (${input.catName})`;

  const html = zh
    ? `
      <p>${escapeHtml(input.displayName)} 你好，</p>
      <p>我們已收到關於 <strong>${escapeHtml(input.catName)}</strong> 的訂製申請。</p>
      <p>目標三日內回覆照片是否足夠，以及預計檔期。付款會在確認後另行安排。</p>
      <p>— nuttyfelt</p>
    `
    : `
      <p>Hi ${escapeHtml(input.displayName)},</p>
      <p>We received your commission request for <strong>${escapeHtml(input.catName)}</strong>.</p>
      <p>We aim to reply within three days on whether the photos are enough and which month is scheduled. Payment stays off-site after we confirm.</p>
      <p>— nuttyfelt</p>
    `;

  const result = await getResend().emails.send({
    from: `nuttyfelt <${emailFrom}>`,
    to: [input.email],
    subject,
    html,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data?.id ?? null;
}

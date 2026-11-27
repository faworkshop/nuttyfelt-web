import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

const faqs = {
  "zh-Hant": [
    { q: "價錢多少？", a: "常規 HK$5,000。早鳥首 3 位 HK$4,250（需 IG 發文及文字評價）。海外運費與匯款手續費另計。" },
    { q: "光環多大？", a: "短毛約 13 cm；長毛約 15 cm。附畫架與護理蠟。" },
    { q: "要等多久？", a: "暫時約每月一件；製作約 3–4 星期。目標三日內回覆照片與檔期。" },
    { q: "有什麼不做？", a: "張口或特殊表情、頸圈／配件、加急單。" },
    { q: "點樣交收？", a: "香港：順豐到付，或南港島線站面交。海外：實報運費，關稅自付。" },
    { q: "可以改幾多？", a: "尾款後最多兩次小修改。結構比例、換貓、轉頭或改光環尺寸不屬於小修改。" },
  ],
  en: [
    { q: "How much?", a: "Regular HK$5,000. Early-bird HK$4,250 for the first 3 clients (IG post + written testimonial). Overseas shipping and remittance fees extra." },
    { q: "Halo size?", a: "Short-hair about 13 cm; long-hair about 15 cm. Stand and protective wax included." },
    { q: "How long?", a: "About one commission a month; roughly 3–4 weeks to make. We aim to reply within 3 days on photos and schedule." },
    { q: "What is not offered?", a: "Open-mouth or special expressions, collars/accessories, rush orders." },
    { q: "Delivery?", a: "Hong Kong: SF Express freight collect, or in-person at a South Island Line MTR station. Overseas: actual shipping; duties paid by the client." },
    { q: "Revisions?", a: "Up to two minor revisions after the balance. Structure, switching cats, head direction, or halo size are not minor revisions." },
  ],
} as const;

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const th = await getTranslations("home");
  const items = faqs[locale === "en" ? "en" : "zh-Hant"];

  return (
    <section className="section-pad">
      <div className="measure">
        <p className="eyebrow">FAQ</p>
        <h1 className="page-title mt-3">{t("title")}</h1>
        <p className="lede">{t("lede")}</p>
        <div className="mt-10 divide-y divide-line">
          {items.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="cursor-pointer font-display text-lg text-ink marker:content-none">
                {item.q}
              </summary>
              <p className="mt-3 leading-relaxed text-ink-muted">{item.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-12">
          <Link href="/commission" className="btn-primary">
            {th("ctaPrimary")}
          </Link>
          <Link
            href="/process"
            className="ml-4 font-ui text-sm text-brass-deep underline-offset-4 hover:underline"
          >
            {th("howLink")}
          </Link>
        </div>
      </div>
    </section>
  );
}

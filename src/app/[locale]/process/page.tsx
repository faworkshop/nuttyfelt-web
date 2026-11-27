import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { PageLoading } from "@/components/PageLoading";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default function ProcessPage({ params }: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <ProcessContent params={params} />
    </Suspense>
  );
}

async function ProcessContent({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("process");
  const th = await getTranslations("home");
  const isEn = locale === "en";

  return (
    <section className="section-pad">
      <div className="measure">
        <p className="eyebrow">Process</p>
        <h1 className="page-title mt-3">{t("title")}</h1>
        <p className="lede">{t("lede")}</p>
      </div>
      <article className="measure mt-12 space-y-12 text-base leading-relaxed text-ink-muted">
        <section>
          <h2 className="font-display text-xl text-ink">
            {isEn ? "Price and inclusions" : "價格與內容"}
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              {isEn
                ? "Regular price HK$5,000 (same for long- and short-hair; complex coloring not extra)"
                : "常規價 HK$5,000（長短毛同價；複雜花色不加價）"}
            </li>
            <li>
              {isEn
                ? "Early-bird HK$4,250 for the first 3 clients (Instagram post + written testimonial)"
                : "早鳥 HK$4,250（首 3 位；需同意 IG 發文及文字評價）"}
            </li>
            <li>
              {isEn
                ? "Includes half-bust, metal halo, stand, B&W hand-drawn portrait, protective wax"
                : "包含：擬真半身、金屬光環板、畫架、一張黑白手繪貓肖像、護理蠟"}
            </li>
            <li>
              {isEn
                ? "Short-hair ~13 cm; long-hair ~15 cm. Not offered: open-mouth/special expressions, accessories, rush"
                : "短毛約 13 cm；長毛約 15 cm。不提供：張口／特殊表情、頸圈配件、加急"}
            </li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-xl text-ink">{isEn ? "Timing" : "檔期"}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>{isEn ? "About one commission per month" : "暫時每月約一件"}</li>
            <li>
              {isEn
                ? "Lead time about 3–4 weeks; reply within ~3 days on photos and month"
                : "製作約 3–4 星期；目標三日內回覆照片與檔期"}
            </li>
            <li>
              {isEn
                ? "50% deposit within 3 days of confirmation"
                : "確認後三日內付 50% 訂金"}
            </li>
          </ul>
        </section>
        <Link href="/commission" className="btn-primary">
          {th("ctaPrimary")}
        </Link>
      </article>
    </section>
  );
}

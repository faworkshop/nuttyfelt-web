import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { PageLoading } from "@/components/PageLoading";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, organizationJsonLd } from "@/lib/structured-data";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (raw === "en" ? "en" : "zh-Hant") as AppLocale;
  const t = await getTranslations({ locale, namespace: "about" });
  return pageMetadata({
    locale,
    pathname: "/about",
    title: t("title"),
    description: t("lede"),
  });
}

export default function AboutPage({ params }: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <AboutContent params={params} />
    </Suspense>
  );
}

async function AboutContent({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (raw === "en" ? "en" : "zh-Hant") as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const th = await getTranslations("home");
  const isEn = locale === "en";

  return (
    <section className="section-pad">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: t("title"), pathname: "/about" },
        ])}
      />
      <div className="measure-wide grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="photo-frame photo-placeholder order-2 aspect-[4/5] md:order-1">
          <div className="halo-ring" />
        </div>
        <div className="order-1 md:order-2">
          <p className="eyebrow">About</p>
          <h1 className="page-title mt-3">{t("title")}</h1>
          <p className="lede">{t("lede")}</p>
          <p className="mt-6 leading-relaxed text-ink-muted">
            {isEn
              ? "nuttyfelt focuses on realistic needle-felted cat half-bust portraits on a brass/gold halo with an easel stand. Each piece is handmade from your photos; Instagram and Threads remain the daily social home, and this site holds clear facts and the commission intake."
              : "nuttyfelt 專注貓的擬真羊毛氈半身肖像，以銅金光環與小畫架呈現。每件按你的照片手工製作；社交平台仍是日常分享的地方，這個網站則放上清楚的事實與訂製入口。"}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/commission" className="btn-primary">
              {th("ctaPrimary")}
            </Link>
            <Link href="/works" className="btn-secondary">
              {th("ctaSecondary")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

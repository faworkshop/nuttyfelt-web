import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { PageLoading } from "@/components/PageLoading";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { faqs } from "@/lib/faq-content";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/structured-data";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (raw === "en" ? "en" : "zh-Hant") as AppLocale;
  const t = await getTranslations({ locale, namespace: "faq" });
  return pageMetadata({
    locale,
    pathname: "/faq",
    title: t("title"),
    description: t("lede"),
  });
}

export default function FaqPage({ params }: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <FaqContent params={params} />
    </Suspense>
  );
}

async function FaqContent({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (raw === "en" ? "en" : "zh-Hant") as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const th = await getTranslations("home");
  const items = faqs[locale];

  return (
    <section className="section-pad">
      <JsonLd data={faqPageJsonLd(locale)} />
      <JsonLd
        data={breadcrumbJsonLd(locale, [{ name: t("title"), pathname: "/faq" }])}
      />
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

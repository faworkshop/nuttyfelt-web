import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { PageLoading } from "@/components/PageLoading";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/structured-data";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (raw === "en" ? "en" : "zh-Hant") as AppLocale;
  const t = await getTranslations({ locale, namespace: "halo" });
  return pageMetadata({
    locale,
    pathname: "/halo",
    title: t("title"),
    description: t("lede"),
  });
}

export default function HaloPage({ params }: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <HaloContent params={params} />
    </Suspense>
  );
}

async function HaloContent({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (raw === "en" ? "en" : "zh-Hant") as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations("halo");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: t("title"), pathname: "/halo" },
        ])}
      />
      <section className="relative min-h-[70svh] overflow-hidden">
        <div className="absolute inset-0">
          <div className="photo-frame photo-placeholder h-full w-full">
            <div className="halo-ring" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/70 to-transparent" />
        </div>
        <div className="relative z-10 flex min-h-[70svh] flex-col justify-end px-5 pb-12 md:px-10 lg:px-16">
          <div className="max-w-xl">
            <p className="eyebrow">The halo</p>
            <h1 className="page-title mt-3">{t("title")}</h1>
            <p className="lede">{t("lede")}</p>
          </div>
        </div>
      </section>
      <section className="section-pad">
        <div className="measure space-y-6 text-lg leading-relaxed text-ink-muted">
          <p>{t("body1")}</p>
          <p>{t("body2")}</p>
          <Link href="/commission" className="btn-primary mt-4">
            {t("cta")}
          </Link>
        </div>
      </section>
    </>
  );
}

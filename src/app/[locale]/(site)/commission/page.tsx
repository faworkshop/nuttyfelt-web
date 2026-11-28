import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CommissionForm } from "@/components/CommissionForm";
import { JsonLd } from "@/components/JsonLd";
import { PageLoading } from "@/components/PageLoading";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import {
  breadcrumbJsonLd,
  commissionOfferJsonLd,
} from "@/lib/structured-data";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (raw === "en" ? "en" : "zh-Hant") as AppLocale;
  const t = await getTranslations({ locale, namespace: "commission" });
  return pageMetadata({
    locale,
    pathname: "/commission",
    title: t("title"),
    description: t("lede"),
  });
}

export default function CommissionPage({ params }: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <CommissionContent params={params} />
    </Suspense>
  );
}

async function CommissionContent({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (raw === "en" ? "en" : "zh-Hant") as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations("commission");

  return (
    <section className="section-pad !pb-24">
      <JsonLd data={commissionOfferJsonLd(locale)} />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: t("title"), pathname: "/commission" },
        ])}
      />
      <div className="measure">
        <p className="eyebrow">Commission</p>
        <h1 className="page-title mt-3">{t("title")}</h1>
        <p className="lede">{t("lede")}</p>
        <Link
          href="/process"
          className="mt-4 inline-flex font-ui text-sm text-brass-deep underline-offset-4 hover:underline"
        >
          {t("processLink")}
        </Link>
        <div className="mt-10">
          <Suspense fallback={<PageLoading />}>
            <CommissionForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

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
  const t = await getTranslations({ locale, namespace: "works" });
  return pageMetadata({
    locale,
    pathname: "/works",
    title: t("title"),
    description: t("lede"),
  });
}

export default function WorksPage({ params }: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <WorksContent params={params} />
    </Suspense>
  );
}

async function WorksContent({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (raw === "en" ? "en" : "zh-Hant") as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations("works");
  const th = await getTranslations("home");

  return (
    <section className="section-pad">
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: t("title"), pathname: "/works" },
        ])}
      />
      <div className="measure-wide">
        <p className="eyebrow">Works</p>
        <h1 className="page-title mt-3">{t("title")}</h1>
        <p className="lede">{t("lede")}</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-6xl gap-12 md:grid-cols-2">
        {[th("workA"), th("workB"), th("workC")].map((title, i) => (
          <figure key={title} className={i === 2 ? "md:col-span-2" : undefined}>
            <div
              className={`photo-frame photo-placeholder ${i === 2 ? "aspect-[16/10] md:aspect-[21/9]" : "aspect-[4/5]"}`}
            >
              <div className={`halo-ring${i === 2 ? " !inset-[8%_30%]" : ""}`} />
            </div>
            <figcaption className="mt-4 font-display text-xl">{title}</figcaption>
          </figure>
        ))}
      </div>
      <div className="measure mt-16 text-center">
        <Link href="/commission" className="btn-primary">
          {th("ctaPrimary")}
        </Link>
      </div>
    </section>
  );
}

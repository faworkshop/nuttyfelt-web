import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { connection } from "next/server";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { PageLoading } from "@/components/PageLoading";
import { WorkFigure } from "@/components/WorkFigure";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { listVisibleWorks, presentWork } from "@/lib/admin/works";
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
  await connection();
  const { locale: raw } = await params;
  const locale = (raw === "en" ? "en" : "zh-Hant") as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations("works");
  const th = await getTranslations("home");

  const rows = await listVisibleWorks();
  const items = rows.map((row) => presentWork(row, locale));

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

      {items.length === 0 ? (
        <div className="measure mt-12 font-body text-ink-muted">
          <p>
            {locale === "en"
              ? "Finished works will appear here soon."
              : "完成作品稍後會放喺呢度。"}
          </p>
        </div>
      ) : (
        <div className="mx-auto mt-12 grid max-w-6xl gap-12 md:grid-cols-2">
          {items.map((item, index) => (
            <WorkFigure
              key={item.id}
              workId={item.id}
              title={item.title}
              caption={item.caption}
              imageUrl={item.imageUrl}
              wide={items.length >= 3 && index === items.length - 1 && items.length % 2 === 1}
            />
          ))}
        </div>
      )}

      <div className="measure mt-16 text-center">
        <Link href="/commission" className="btn-primary">
          {th("ctaPrimary")}
        </Link>
      </div>
    </section>
  );
}

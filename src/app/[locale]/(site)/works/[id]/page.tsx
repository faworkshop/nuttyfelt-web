import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { connection } from "next/server";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { PageLoading } from "@/components/PageLoading";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { getVisibleWork, presentWork } from "@/lib/admin/works";
import { SITE_NAME, absoluteUrl, localizedUrl } from "@/lib/site";

type Props = { params: Promise<{ locale: string; id: string }> };

function workPath(locale: AppLocale, id: string) {
  return locale === "en" ? `/en/works/${id}` : `/works/${id}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, id } = await params;
  const locale = (raw === "en" ? "en" : "zh-Hant") as AppLocale;
  const work = await getVisibleWork(id);
  if (!work) {
    return { title: { absolute: `Works · ${SITE_NAME}` } };
  }

  const view = presentWork(work, locale);
  const path = workPath(locale, id);
  const canonical = absoluteUrl(path);
  const fullTitle = `${view.title} · ${SITE_NAME}`;
  const description = view.caption || view.title;

  return {
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical,
      languages: {
        "zh-Hant": absoluteUrl(workPath("zh-Hant", id)),
        en: absoluteUrl(workPath("en", id)),
        "x-default": absoluteUrl(workPath("zh-Hant", id)),
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: locale === "en" ? "en_HK" : "zh_HK",
      type: "website",
      ...(view.imageUrl
        ? { images: [{ url: absoluteUrl(view.imageUrl) }] }
        : {}),
    },
  };
}

export default function WorkDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <WorkDetailContent params={params} />
    </Suspense>
  );
}

async function WorkDetailContent({ params }: Props) {
  await connection();
  const { locale: raw, id } = await params;
  const locale = (raw === "en" ? "en" : "zh-Hant") as AppLocale;
  setRequestLocale(locale);

  const work = await getVisibleWork(id);
  if (!work) notFound();

  const t = await getTranslations("works");
  const th = await getTranslations("home");
  const view = presentWork(work, locale);
  const [hero, ...rest] = view.imageUrls;

  return (
    <section className="section-pad">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: SITE_NAME,
              item: localizedUrl(locale, "/"),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: t("title"),
              item: localizedUrl(locale, "/works"),
            },
            {
              "@type": "ListItem",
              position: 3,
              name: view.title,
              item: absoluteUrl(workPath(locale, id)),
            },
          ],
        }}
      />

      <div className="mx-auto max-w-5xl">
        <Link
          href="/works"
          className="font-ui text-sm text-brass-deep underline-offset-4 hover:underline"
        >
          ← {t("back")}
        </Link>

        <header className="mt-6 max-w-2xl">
          <p className="eyebrow">Works</p>
          <h1 className="page-title mt-3">{view.title}</h1>
          {view.caption ? <p className="lede mt-4">{view.caption}</p> : null}
        </header>

        {hero ? (
          <div className="photo-frame mt-10 aspect-[4/5] w-full max-w-xl overflow-hidden md:aspect-[3/4]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero}
              alt={view.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="photo-frame photo-placeholder mt-10 aspect-[4/5] max-w-xl">
            <div className="halo-ring" />
          </div>
        )}

        {rest.length > 0 ? (
          <div className="mt-14">
            <h2 className="font-display text-2xl text-ink">{t("gallery")}</h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              {rest.map((url, index) => (
                <li key={url}>
                  <div className="photo-frame aspect-[4/5] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`${view.title} ${index + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-16">
          <Link href="/commission" className="btn-primary">
            {th("ctaPrimary")}
          </Link>
        </div>
      </div>
    </section>
  );
}

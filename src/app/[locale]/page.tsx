import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { PageLoading } from "@/components/PageLoading";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import {
  commissionOfferJsonLd,
  organizationJsonLd,
} from "@/lib/structured-data";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (raw === "en" ? "en" : "zh-Hant") as AppLocale;
  const t = await getTranslations({ locale, namespace: "home" });
  return pageMetadata({
    locale,
    pathname: "/",
    title: t("headline"),
    description: t("lede"),
  });
}

export default function HomePage({ params }: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <HomeContent params={params} />
    </Suspense>
  );
}

async function HomeContent({ params }: Props) {
  const { locale: raw } = await params;
  const locale = (raw === "en" ? "en" : "zh-Hant") as AppLocale;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={commissionOfferJsonLd(locale)} />
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <div className="photo-frame photo-placeholder h-full w-full">
            <div className="halo-ring" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/75 to-paper/20 md:via-paper/55" />
        </div>
        <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-14 pt-28 md:px-10 md:pb-20 lg:px-16">
          <div className="max-w-xl">
            <Image
              src="/brand/nuttyfelt-logo.png"
              alt="nuttyfelt"
              width={448}
              height={96}
              className="brand-logo-lg"
              style={{ width: "auto", height: "auto" }}
              priority
            />
            <h1 className="mt-5 font-display text-2xl font-medium leading-snug text-ink md:text-3xl">
              {t("headline")}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted md:text-lg">
              {t("lede")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/commission" className="btn-primary">
                {t("ctaPrimary")}
              </Link>
              <Link href="/works" className="btn-secondary">
                {t("ctaSecondary")}
              </Link>
            </div>
            <p className="mt-6 font-ui text-xs text-ink-muted/80">{t("photoNote")}</p>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-line/60">
        <div className="measure-wide grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="eyebrow">Halo</p>
            <h2 className="section-title mt-3">{t("haloTitle")}</h2>
            <p className="lede">{t("haloBody")}</p>
            <Link
              href="/halo"
              className="mt-6 inline-flex font-ui text-sm text-brass-deep underline-offset-4 hover:underline"
            >
              {t("haloLink")}
            </Link>
          </div>
          <div className="photo-frame photo-placeholder aspect-[4/5]">
            <div className="halo-ring" />
          </div>
        </div>
      </section>

      <section className="section-pad bg-mist/40">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <p className="eyebrow">Works</p>
            <h2 className="section-title mt-3">{t("worksTitle")}</h2>
            <p className="lede">{t("worksBody")}</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[t("workA"), t("workB"), t("workC")].map((title) => (
              <figure key={title}>
                <div className="photo-frame photo-placeholder aspect-[4/5]">
                  <div className="halo-ring" />
                </div>
                <figcaption className="mt-4 font-display text-lg">{title}</figcaption>
              </figure>
            ))}
          </div>
          <Link
            href="/works"
            className="mt-10 inline-flex font-ui text-sm text-brass-deep underline-offset-4 hover:underline"
          >
            {t("worksLink")}
          </Link>
        </div>
      </section>

      <section className="section-pad">
        <div className="measure">
          <p className="eyebrow">Process</p>
          <h2 className="section-title mt-3">{t("howTitle")}</h2>
          <p className="lede">{t("howBody")}</p>
          <ol className="mt-10 space-y-6 border-t border-line pt-8 font-ui">
            {[t("how1"), t("how2"), t("how3")].map((item, index) => (
              <li key={item} className="flex gap-4 text-base">
                <span className="text-brass-deep">0{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <Link
            href="/process"
            className="mt-8 inline-flex font-ui text-sm text-brass-deep underline-offset-4 hover:underline"
          >
            {t("howLink")}
          </Link>
        </div>
      </section>

      <section className="section-pad border-t border-line/60 bg-mist/30">
        <div className="measure text-center">
          <p className="font-display text-xl leading-relaxed md:text-2xl">{t("capacity")}</p>
          <Link href="/commission" className="btn-primary mt-8">
            {t("capacityCta")}
          </Link>
        </div>
      </section>
    </>
  );
}

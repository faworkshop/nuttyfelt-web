import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { PageLoading } from "@/components/PageLoading";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default function HaloPage({ params }: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <HaloContent params={params} />
    </Suspense>
  );
}

async function HaloContent({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("halo");

  return (
    <>
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

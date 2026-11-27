import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CommissionForm } from "@/components/CommissionForm";
import { PageLoading } from "@/components/PageLoading";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default function CommissionPage({ params }: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <CommissionContent params={params} />
    </Suspense>
  );
}

async function CommissionContent({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("commission");

  return (
    <section className="section-pad !pb-24">
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

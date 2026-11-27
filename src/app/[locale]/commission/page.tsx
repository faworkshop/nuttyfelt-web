import { getTranslations, setRequestLocale } from "next-intl/server";
import { CommissionForm } from "@/components/CommissionForm";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function CommissionPage({ params }: Props) {
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
        <p className="mt-6 rounded-md border border-line bg-wool px-4 py-3 font-ui text-xs text-ink-muted">
          {t("prototypeNote")}
        </p>
        <div className="mt-10">
          <CommissionForm />
        </div>
      </div>
    </section>
  );
}

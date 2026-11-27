import type { Metadata } from "next";
import type { AppLocale, AppPathname } from "@/i18n/routing";
import { SITE_NAME, languageAlternates, localizedUrl } from "./site";

export function pageMetadata(input: {
  locale: AppLocale;
  pathname: AppPathname;
  title: string;
  description: string;
}): Metadata {
  const canonical = localizedUrl(input.locale, input.pathname);
  const fullTitle =
    input.pathname === "/"
      ? `${SITE_NAME} · ${input.title}`
      : `${input.title} · ${SITE_NAME}`;

  return {
    title: fullTitle,
    description: input.description,
    alternates: {
      canonical,
      languages: languageAlternates(input.pathname),
    },
    openGraph: {
      title: fullTitle,
      description: input.description,
      url: canonical,
      siteName: SITE_NAME,
      locale: input.locale === "en" ? "en_HK" : "zh_HK",
      type: "website",
    },
  };
}

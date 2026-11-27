import type { AppLocale, AppPathname } from "@/i18n/routing";
import { faqs, type FaqLocale } from "./faq-content";
import {
  OFFER,
  SITE_NAME,
  SITE_URL,
  SOCIAL,
  localizedUrl,
} from "./site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Hong Kong studio making handmade realistic needle-felted cat half-bust portraits on a brass/gold halo.",
    areaServed: "HK",
    sameAs: [SOCIAL.instagram, SOCIAL.threads],
  };
}

export function commissionOfferJsonLd(locale: AppLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name:
      locale === "en"
        ? "Custom needle-felted cat portrait"
        : "訂製羊毛氈貓肖像",
    description:
      locale === "en"
        ? "Handmade realistic needle-felted cat half-bust on a brass/gold halo with easel stand. About one commission a month; roughly 3–4 weeks to make."
        : "手工擬真羊毛氈貓半身肖像，固定於銅金光環與畫架。約每月一件；製作約 3–4 星期。",
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: "HK",
    offers: [
      {
        "@type": "Offer",
        name: locale === "en" ? "Regular commission" : "常規訂製",
        price: OFFER.price,
        priceCurrency: OFFER.priceCurrency,
        availability: "https://schema.org/LimitedAvailability",
        url: localizedUrl(locale, "/commission"),
      },
      {
        "@type": "Offer",
        name: locale === "en" ? "Early-bird (first 3)" : "早鳥（首 3 位）",
        price: OFFER.earlyBirdPrice,
        priceCurrency: OFFER.priceCurrency,
        availability: "https://schema.org/LimitedAvailability",
        url: localizedUrl(locale, "/commission"),
      },
    ],
  };
}

export function faqPageJsonLd(locale: AppLocale) {
  const key = (locale === "en" ? "en" : "zh-Hant") as FaqLocale;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: faqs[key].map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function breadcrumbJsonLd(
  locale: AppLocale,
  crumbs: { name: string; pathname: AppPathname }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_NAME,
        item: localizedUrl(locale, "/"),
      },
      ...crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: crumb.name,
        item: localizedUrl(locale, crumb.pathname),
      })),
    ],
  };
}

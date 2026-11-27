import { routing, type AppLocale, type AppPathname } from "@/i18n/routing";

/** Canonical public origin. Override with NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://nuttyfelt-web-production.up.railway.app"
).replace(/\/$/, "");

export const SITE_NAME = "nuttyfelt";

export const SOCIAL = {
  instagram: "https://www.instagram.com/nuttyfelt/",
  threads: "https://www.threads.net/@nuttyfelt",
} as const;

export const OFFER = {
  priceCurrency: "HKD",
  price: 5000,
  earlyBirdPrice: 4250,
  shortHairCm: 13,
  longHairCm: 15,
} as const;

const localePrefix = (locale: AppLocale) =>
  locale === routing.defaultLocale ? "" : `/${locale}`;

export function absoluteUrl(pathname: string = "/") {
  if (pathname === "/") return SITE_URL;
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function localizedPath(locale: AppLocale, pathname: AppPathname = "/") {
  const prefix = localePrefix(locale);
  if (pathname === "/") return prefix || "/";
  return `${prefix}${pathname}`;
}

export function localizedUrl(locale: AppLocale, pathname: AppPathname = "/") {
  const path = localizedPath(locale, pathname);
  return absoluteUrl(path === "/" ? "/" : path);
}

export function languageAlternates(pathname: AppPathname = "/") {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = localizedUrl(locale, pathname);
  }
  languages["x-default"] = localizedUrl(routing.defaultLocale, pathname);
  return languages;
}

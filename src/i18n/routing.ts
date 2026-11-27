import { defineRouting } from "next-intl/routing";

export const pathnames = {
  "/": "/",
  "/works": "/works",
  "/halo": "/halo",
  "/process": "/process",
  "/about": "/about",
  "/faq": "/faq",
  "/commission": "/commission",
} as const;

export const routing = defineRouting({
  locales: ["zh-Hant", "en"],
  defaultLocale: "zh-Hant",
  localePrefix: "as-needed",
  localeDetection: false,
  pathnames,
});

export type AppLocale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof pathnames;

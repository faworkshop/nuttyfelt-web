import { defineRouting } from "next-intl/routing";

export const pathnames = {
  "/": "/",
  "/works": "/works",
  "/halo": "/halo",
  "/process": "/process",
  "/about": "/about",
  "/faq": "/faq",
  "/commission": "/commission",
  "/admin": "/admin",
  "/admin/commissions": "/admin/commissions",
  "/admin/commissions/[id]": "/admin/commissions/[id]",
  "/admin/works": "/admin/works",
  "/sign-in": "/sign-in",
  "/sign-up": "/sign-up",
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
/** Pathnames without dynamic `[param]` segments (safe for bare `Link href`). */
export type StaticAppPathname = Exclude<AppPathname, "/admin/commissions/[id]">;

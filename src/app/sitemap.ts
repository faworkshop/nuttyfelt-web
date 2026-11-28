import type { MetadataRoute } from "next";
import { routing, type AppPathname } from "@/i18n/routing";
import { languageAlternates, localizedUrl } from "@/lib/site";

const paths = (Object.keys(routing.pathnames) as AppPathname[]).filter(
  (pathname) =>
    !pathname.startsWith("/admin") &&
    !pathname.includes("[") &&
    pathname !== "/sign-in" &&
    pathname !== "/sign-up",
);

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const pathname of paths) {
    const languages = languageAlternates(pathname);
    for (const locale of routing.locales) {
      entries.push({
        url: localizedUrl(locale, pathname),
        lastModified: new Date(),
        changeFrequency: pathname === "/commission" ? "weekly" : "monthly",
        priority:
          pathname === "/" ? 1 : pathname === "/commission" ? 0.9 : 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}

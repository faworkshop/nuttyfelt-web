import type { MetadataRoute } from "next";
import { routing, type AppPathname } from "@/i18n/routing";
import { listVisibleWorks } from "@/lib/admin/works";
import { absoluteUrl, languageAlternates, localizedUrl } from "@/lib/site";

const paths = (Object.keys(routing.pathnames) as AppPathname[]).filter(
  (pathname) =>
    !pathname.startsWith("/admin") &&
    !pathname.includes("[") &&
    pathname !== "/sign-in" &&
    pathname !== "/sign-up",
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  try {
    const works = await listVisibleWorks();
    for (const work of works) {
      const languages: Record<string, string> = {
        "zh-Hant": absoluteUrl(`/works/${work.id}`),
        en: absoluteUrl(`/en/works/${work.id}`),
        "x-default": absoluteUrl(`/works/${work.id}`),
      };
      for (const locale of routing.locales) {
        entries.push({
          url: languages[locale],
          lastModified: work.updatedAt,
          changeFrequency: "weekly",
          priority: 0.6,
          alternates: { languages },
        });
      }
    }
  } catch {
    // Sitemap still ships static routes if DB is unavailable at build.
  }

  return entries;
}

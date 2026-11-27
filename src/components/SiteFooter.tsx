import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppPathname } from "@/i18n/routing";

const navItems: {
  href: AppPathname;
  key: "home" | "works" | "halo" | "process" | "about" | "faq" | "commission";
}[] = [
  { href: "/", key: "home" },
  { href: "/works", key: "works" },
  { href: "/halo", key: "halo" },
  { href: "/process", key: "process" },
  { href: "/about", key: "about" },
  { href: "/faq", key: "faq" },
  { href: "/commission", key: "commission" },
];

export async function SiteFooter() {
  const t = await getTranslations("nav");
  const tRoot = await getTranslations();

  return (
    <footer className="border-t border-line/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.2fr_1fr_1fr] md:px-10 lg:px-16">
        <div>
          <Link href="/" aria-label="nuttyfelt home">
            <Image
              src="/brand/nuttyfelt-logo.png"
              alt="nuttyfelt"
              width={280}
              height={60}
              className="brand-logo"
            />
          </Link>
          <p className="mt-3 font-ui text-sm text-ink-muted">{tRoot("footerTag")}</p>
        </div>
        <div>
          <p className="font-ui text-xs uppercase tracking-[0.16em] text-brass-deep">Nav</p>
          <ul className="mt-4 space-y-2 font-ui text-sm">
            {navItems.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="text-ink-muted hover:text-ink">
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-ui text-xs uppercase tracking-[0.16em] text-brass-deep">
            {tRoot("footerSocial")}
          </p>
          <ul className="mt-4 space-y-2 font-ui text-sm">
            <li>
              <a
                className="text-ink-muted hover:text-ink"
                href="https://instagram.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                {tRoot("instagram")}
              </a>
            </li>
            <li>
              <a
                className="text-ink-muted hover:text-ink"
                href="https://threads.net"
                rel="noopener noreferrer"
                target="_blank"
              >
                {tRoot("threads")}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

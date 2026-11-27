"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppPathname } from "@/i18n/routing";

const navItems: { href: AppPathname; key: "home" | "works" | "halo" | "process" | "about" | "faq" }[] = [
  { href: "/", key: "home" },
  { href: "/works", key: "works" },
  { href: "/halo", key: "halo" },
  { href: "/process", key: "process" },
  { href: "/about", key: "about" },
  { href: "/faq", key: "faq" },
];

export function SiteHeader() {
  const t = useTranslations("nav");
  const tUi = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const otherLocale = locale === "en" ? "zh-Hant" : "en";
  const otherLabel = locale === "en" ? "中文" : "EN";

  // Close when the route changes (covers soft nav from menu links).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className="relative z-30">
      {/* Blur stays on the bar only — backdrop-filter would trap fixed children. */}
      <div className="border-b border-line/70 bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-10 md:py-4 lg:px-16">
          <Link href="/" className="shrink-0" aria-label="nuttyfelt home">
            <Image
              src="/brand/nuttyfelt-logo.png"
              alt="nuttyfelt"
              width={280}
              height={60}
              className="brand-logo"
              priority
            />
          </Link>
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href={pathname}
              locale={otherLocale}
              className="font-ui text-sm text-ink-muted hover:text-ink"
            >
              {otherLabel}
            </Link>
            <button
              type="button"
              className="font-ui text-sm text-ink md:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen(true)}
            >
              {tUi("menu")}
            </button>
            <nav className="hidden items-center gap-5 md:flex" aria-label="Primary">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`nav-link${pathname === item.href ? " text-ink" : ""}`}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-40 bg-paper md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={tUi("menu")}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-line/70 px-5 py-3">
              <Image
                src="/brand/nuttyfelt-logo.png"
                alt=""
                width={280}
                height={60}
                className="brand-logo"
              />
              <button
                type="button"
                className="font-ui text-sm text-ink"
                onClick={() => setOpen(false)}
              >
                {tUi("close")}
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-8" aria-label="Mobile">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="font-display text-2xl text-ink"
                  onClick={() => setOpen(false)}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}

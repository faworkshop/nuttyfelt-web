"use client";

import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { StaticAppPathname } from "@/i18n/routing";

const navItems: { href: StaticAppPathname; label: string }[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/commissions", label: "Commissions" },
  { href: "/admin/works", label: "Works & Home" },
];

type Props = {
  children: React.ReactNode;
};

export function AdminShell({ children }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col bg-wool md:flex-row">
      <header className="flex items-center justify-between border-b border-line bg-paper px-4 py-3 md:hidden">
        <p className="font-display text-lg text-ink">nuttyfelt admin</p>
        <div className="flex items-center gap-3">
          <UserButton />
          <button
            type="button"
            className="font-ui text-sm text-ink"
            aria-expanded={menuOpen}
            aria-controls="admin-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <aside
        id="admin-nav"
        className={`${
          menuOpen ? "flex" : "hidden"
        } w-full flex-col border-b border-line bg-paper px-4 py-4 md:flex md:min-h-dvh md:w-56 md:shrink-0 md:border-b-0 md:border-r md:px-5 md:py-6`}
      >
        <div className="mb-8 hidden items-center justify-between md:flex">
          <p className="font-display text-xl text-ink">nuttyfelt</p>
          <UserButton />
        </div>
        <p className="mb-4 hidden font-ui text-xs uppercase tracking-[0.14em] text-ink-muted md:block">
          Admin
        </p>
        <nav className="flex flex-col gap-1" aria-label="Admin">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-md px-3 py-2.5 font-ui text-sm ${
                  active
                    ? "bg-mist text-ink"
                    : "text-ink-muted hover:bg-mist/60 hover:text-ink"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/"
          className="mt-auto pt-8 font-ui text-sm text-brass-deep underline-offset-4 hover:underline"
          onClick={() => setMenuOpen(false)}
        >
          View public site
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

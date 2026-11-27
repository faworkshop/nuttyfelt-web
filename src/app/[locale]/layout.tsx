import { Figtree, Fraunces, Noto_Sans_TC, Noto_Serif_HK, Source_Serif_4 } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const notoSerifHk = Noto_Serif_HK({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-noto-serif-hk",
  display: "swap",
});

const notoSansTc = Noto_Sans_TC({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

const fontClassName = `${fraunces.variable} ${sourceSerif.variable} ${figtree.variable} ${notoSerifHk.variable} ${notoSansTc.variable} h-full`;

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (hasLocale(routing.locales, raw) ? raw : routing.defaultLocale) as AppLocale;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    metadataBase: new URL(SITE_URL),
    ...pageMetadata({
      locale,
      pathname: "/",
      title: t("headline"),
      description: t("lede"),
    }),
  };
}

// Locale must be read from params for next-intl; Instant validation can't wrap <html> in Suspense.
export const instant = false;

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={fontClassName}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={messages}>
          <Suspense fallback={<div className="h-16 border-b border-line/60 bg-paper/90" />}>
            <SiteHeader />
          </Suspense>
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

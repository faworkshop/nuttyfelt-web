import { ClerkProvider } from "@clerk/nextjs";
import { Figtree, Fraunces, Noto_Sans_TC, Noto_Serif_HK, Source_Serif_4 } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SITE_NAME, SITE_URL } from "@/lib/site";
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

/** Static only — per-page `generateMetadata` owns titles. Avoids Instant blocking on `params`. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
};

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
        <ClerkProvider>
          <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

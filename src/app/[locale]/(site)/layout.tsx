import { Suspense } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

type Props = {
  children: React.ReactNode;
};

export default function SiteLayout({ children }: Props) {
  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-line/60 bg-paper/90" />}>
        <SiteHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}

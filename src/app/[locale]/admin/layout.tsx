import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

type Props = {
  children: React.ReactNode;
};

async function AdminGate({ children }: Props) {
  await auth.protect();
  return <AdminShell>{children}</AdminShell>;
}

export default function AdminLayout({ children }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-wool font-ui text-ink-muted">
          Loading admin…
        </div>
      }
    >
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

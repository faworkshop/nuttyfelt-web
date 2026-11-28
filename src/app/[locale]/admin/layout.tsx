import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/admin/auth";

type Props = {
  children: React.ReactNode;
};

async function AdminGate({ children }: Props) {
  // Auth once for the whole admin tree — pages no longer re-call protect().
  await requireAdminPage();
  return <AdminShell>{children}</AdminShell>;
}

export default function AdminLayout({ children }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-wool font-ui text-ink-muted">
          Loading admin…
        </div>
      }
    >
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

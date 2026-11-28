import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { CommissionAdminForm } from "@/components/admin/CommissionAdminForm";
import { CommissionStatusForm } from "@/components/admin/CommissionStatusForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Link } from "@/i18n/navigation";
import { getCommission } from "@/lib/admin/commissions";
import { getSignedDownloadUrl } from "@/lib/r2-objects";
import { toReferenceNo } from "@/lib/reference";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

function formatWhen(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-HK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="grid gap-1 border-b border-line/60 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="font-ui text-xs uppercase tracking-wide text-ink-muted">
        {label}
      </dt>
      <dd className="font-body text-ink whitespace-pre-wrap break-words">{value}</dd>
    </div>
  );
}

async function CommissionDetail({ id }: { id: string }) {
  await connection();
  await auth.protect();

  const data = await getCommission(id);
  if (!data) notFound();

  const { request, files } = data;
  const basic = files.filter((f) => f.group === "basic");
  const extra = files.filter((f) => f.group === "extra");

  const withUrls = await Promise.all(
    files.map(async (file) => ({
      ...file,
      url: await getSignedDownloadUrl(file.storageKey),
    })),
  );
  const basicLinks = withUrls.filter((f) => f.group === "basic");
  const extraLinks = withUrls.filter((f) => f.group === "extra");

  const living =
    request.livingStatus === "with"
      ? "Still with client (private)"
      : request.livingStatus === "passed"
        ? "Passed (private)"
        : request.livingStatus === "skip"
          ? "Prefer not to say (private)"
          : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/commissions"
        className="font-ui text-sm text-brass-deep underline-offset-4 hover:underline"
      >
        ← Commissions
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-ui text-xs text-ink-muted">
            {toReferenceNo(request.id)}
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink md:text-4xl">
            {request.catName}
          </h1>
          <p className="mt-1 font-body text-ink-muted">{request.displayName}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <section className="mt-8 rounded-md border border-line bg-paper p-4 md:p-5">
        <h2 className="font-display text-xl text-ink">Status</h2>
        <div className="mt-4">
          <CommissionStatusForm id={request.id} status={request.status} />
        </div>
        {request.failureReason ? (
          <p className="mt-3 font-ui text-sm text-danger">
            Failure: {request.failureReason}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-md border border-line bg-paper p-4 md:p-5">
        <h2 className="font-display text-xl text-ink">Request</h2>
        <dl className="mt-2">
          <Row label="Received" value={formatWhen(request.createdAt)} />
          <Row label="Locale" value={request.locale} />
          <Row label="Email" value={request.email} />
          <Row label="Instagram" value={request.instagram} />
          <Row label="WhatsApp" value={request.whatsapp} />
          <Row
            label="Location"
            value={
              request.location === "hk"
                ? "Hong Kong"
                : request.country || "Other"
            }
          />
          <Row label="Coat" value={request.coatLength} />
          <Row label="Features" value={request.features} />
          <Row label="Found via" value={request.foundVia} />
          <Row label="Sex / breed" value={request.sexBreed} />
          <Row label="Hope date" value={request.hopeDate} />
          <Row label="Stories" value={request.stories} />
          <Row label="Living status" value={living} />
          <Row
            label="Publicity"
            value={request.publicity === "tag" ? "OK to tag" : "Do not tag"}
          />
          <Row
            label="Notify email"
            value={formatWhen(request.notifyEmailSentAt)}
          />
          <Row
            label="Confirm email"
            value={formatWhen(request.confirmEmailSentAt)}
          />
        </dl>
      </section>

      <section className="mt-6 rounded-md border border-line bg-paper p-4 md:p-5">
        <h2 className="font-display text-xl text-ink">
          Photos ({files.length})
        </h2>
        <p className="mt-1 font-ui text-xs text-ink-muted">
          Signed links expire in 7 days — reopen this page for fresh links.
        </p>
        <PhotoGroup title={`Basic (${basic.length})`} files={basicLinks} />
        <PhotoGroup title={`Extra (${extra.length})`} files={extraLinks} />
      </section>

      <section className="mt-6 rounded-md border border-line bg-paper p-4 md:p-5">
        <h2 className="font-display text-xl text-ink">Studio notes</h2>
        <div className="mt-4">
          <CommissionAdminForm request={request} />
        </div>
      </section>
    </div>
  );
}

function PhotoGroup({
  title,
  files,
}: {
  title: string;
  files: {
    id: string;
    originalFilename: string;
    sizeBytes: number;
    url: string;
  }[];
}) {
  if (!files.length) return null;
  return (
    <div className="mt-5">
      <h3 className="font-ui text-sm text-ink-muted">{title}</h3>
      <ul className="mt-2 space-y-2">
        {files.map((file) => (
          <li key={file.id}>
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="font-ui text-sm text-brass-deep underline-offset-4 hover:underline"
            >
              {file.originalFilename}
            </a>
            <span className="ml-2 font-ui text-xs text-ink-muted">
              {(file.sizeBytes / (1024 * 1024)).toFixed(1)} MB
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function AdminCommissionDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense
      fallback={<div className="font-ui text-ink-muted">Loading request…</div>}
    >
      <CommissionDetail id={id} />
    </Suspense>
  );
}

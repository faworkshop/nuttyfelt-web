import { auth } from "@clerk/nextjs/server";

export default async function AdminWorksPage() {
  await auth.protect();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl text-ink md:text-4xl">Works &amp; Home</h1>
      <p className="mt-3 font-body text-ink-muted">
        Manage finished-work entries, studio images, and Home featured slots.
        Private client fields stay off this surface.
      </p>
      <div className="mt-8 rounded-md border border-dashed border-line bg-paper px-4 py-10 text-center font-ui text-sm text-ink-muted">
        Content management not wired yet.
      </div>
    </div>
  );
}

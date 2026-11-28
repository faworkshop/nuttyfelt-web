import { Link } from "@/i18n/navigation";

type Props = {
  title: string;
  caption?: string | null;
  imageUrl?: string | null;
  wide?: boolean;
  workId?: string;
};

export function WorkFigure({ title, caption, imageUrl, wide, workId }: Props) {
  const frame = (
    <div
      className={`photo-frame ${imageUrl ? "" : "photo-placeholder"} ${
        wide ? "aspect-[16/10] md:aspect-[21/9]" : "aspect-[4/5]"
      }`}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
      ) : (
        <div className={`halo-ring${wide ? " !inset-[8%_30%]" : ""}`} />
      )}
    </div>
  );

  const captionBlock = (
    <>
      <figcaption className="mt-4 font-display text-xl">{title}</figcaption>
      {caption ? (
        <p className="mt-2 font-body text-sm text-ink-muted">{caption}</p>
      ) : null}
    </>
  );

  return (
    <figure className={wide ? "md:col-span-2" : undefined}>
      {workId ? (
        <Link
          href={{ pathname: "/works/[id]", params: { id: workId } }}
          className="group block outline-none"
        >
          <div className="transition duration-300 group-hover:opacity-95 group-focus-visible:ring-2 group-focus-visible:ring-brass/40">
            {frame}
          </div>
          <div className="transition group-hover:text-brass-deep">{captionBlock}</div>
        </Link>
      ) : (
        <>
          {frame}
          {captionBlock}
        </>
      )}
    </figure>
  );
}

export function PageLoading() {
  return (
    <div className="section-pad" aria-hidden>
      <div className="measure space-y-4">
        <div className="h-3 w-24 rounded bg-mist" />
        <div className="h-8 w-2/3 max-w-md rounded bg-mist" />
        <div className="h-4 w-full max-w-lg rounded bg-mist" />
        <div className="h-4 w-5/6 max-w-md rounded bg-mist" />
      </div>
    </div>
  );
}

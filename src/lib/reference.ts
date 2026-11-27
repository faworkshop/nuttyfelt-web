/** Short public reference derived from the request UUID (e.g. NF-A1B2C3D4). */
export function toReferenceNo(requestId: string): string {
  const hex = requestId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `NF-${hex}`;
}

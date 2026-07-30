function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/** Returns the first booked range that conflicts with the proposed one, or
 * null. This is a friendly preview only — the database's own constraint is
 * the real, authoritative check at booking-creation time. */
export function findConflict(startAt, endAt, bookedRanges) {
  if (!startAt || !endAt) return null;
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (!(end > start)) return null;

  return (
    bookedRanges.find((r) => rangesOverlap(start, end, new Date(r.startAt), new Date(r.endAt))) || null
  );
}

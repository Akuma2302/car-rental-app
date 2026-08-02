const STORAGE_KEY = 'jalango_pending_booking';

/** Called the moment a booking reaches "pending" (right after creation) so
 * the customer can find their way back even if they close the tab before
 * confirming payment. */
export function savePendingBooking(bookingId, carId) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ bookingId, carId }));
  } catch {
    // localStorage can be unavailable (private browsing, storage full) —
    // the resume feature just won't work locally; not worth failing over.
  }
}

export function readPendingBooking() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Called once a booking reaches a final state (confirmed or cancelled) —
 * nothing left to resume. */
export function clearPendingBooking() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Same reasoning as above — safe to ignore.
  }
}

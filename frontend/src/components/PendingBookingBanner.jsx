import { useEffect, useState } from 'react';
import { useBookingContext } from '../context/BookingContext.jsx';
import { fetchBookingStatus } from '../services/bookingService.js';
import { readPendingBooking, savePendingBooking, clearPendingBooking } from '../utils/pendingBooking.js';
import { CloseIcon } from './icons.jsx';

function getBookingIdFromUrl() {
  return new URLSearchParams(window.location.search).get('booking');
}

/** Removes the ?booking= param so refreshing doesn't keep re-triggering
 * the auto-open, without a full page reload. */
function stripBookingParamFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('booking');
  window.history.replaceState({}, '', url.pathname + url.search);
}

function PendingBookingBanner() {
  const { resumeBooking } = useBookingContext();
  const [pending, setPending] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const urlBookingId = getBookingIdFromUrl();
    const stored = readPendingBooking();
    const bookingId = urlBookingId || stored?.bookingId;
    if (!bookingId) return undefined;

    let cancelled = false;

    fetchBookingStatus(bookingId)
      .then((booking) => {
        if (cancelled) return;

        if (booking.status !== 'pending') {
          clearPendingBooking();
          if (urlBookingId) stripBookingParamFromUrl();
          return;
        }

        savePendingBooking(booking.id, booking.carId);

        if (urlBookingId) {
          // They followed a specific link (e.g. from the WhatsApp message)
          // — take them straight there instead of making them click twice.
          stripBookingParamFromUrl();
          resumeBooking(booking.carId, booking.id);
        } else {
          setPending({ bookingId: booking.id, carId: booking.carId, carName: booking.carName });
        }
      })
      .catch(() => {
        // Booking no longer exists or the saved reference is stale.
        clearPendingBooking();
        if (urlBookingId) stripBookingParamFromUrl();
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!pending || dismissed) return null;

  return (
    <div className="pending-banner">
      <span>
        You have a pending booking for <b>{pending.carName}</b> — payment not yet confirmed.
      </span>
      <div className="pending-banner-actions">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => resumeBooking(pending.carId, pending.bookingId)}
        >
          Resume booking
        </button>
        <button
          type="button"
          className="pending-banner-dismiss"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          <CloseIcon width={14} height={14} />
        </button>
      </div>
    </div>
  );
}

export default PendingBookingBanner;

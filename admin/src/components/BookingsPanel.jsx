import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchAdminBookings, cancelBooking, uploadBookingReceipt } from '../services/bookingService.js';
import { formatDateTime } from '../utils/date.js';
import BookingsFilters, { DEFAULT_BOOKING_FILTERS, getDurationBand } from './BookingsFilters.jsx';
import { CalendarIcon, CheckCircleIcon, ClockIcon, CarIcon } from './icons.jsx';

const STATUS_LABELS = { pending: 'Pending', booked: 'Booked', cancelled: 'Cancelled' };

function durationLabel(startAt, endAt) {
  const hours = (new Date(endAt) - new Date(startAt)) / (1000 * 60 * 60);
  if (hours < 24) return `${Math.round(hours * 10) / 10}h`;
  const days = Math.floor(hours / 24);
  const rem = Math.round(hours % 24);
  return rem > 0 ? `${days}d ${rem}h` : `${days}d`;
}

function applyFilters(bookings, filters) {
  const query = filters.search.trim().toLowerCase();

  return bookings.filter((b) => {
    if (filters.status && b.status !== filters.status) return false;
    if (filters.carId && b.carId !== filters.carId) return false;
    if (filters.duration && getDurationBand(b.startAt, b.endAt) !== filters.duration) return false;

    if (filters.bookedFrom && new Date(b.createdAt) < new Date(`${filters.bookedFrom}T00:00:00`)) return false;
    if (filters.bookedTo && new Date(b.createdAt) > new Date(`${filters.bookedTo}T23:59:59`)) return false;

    if (filters.pickupFrom && new Date(b.startAt) < new Date(`${filters.pickupFrom}T00:00:00`)) return false;
    if (filters.pickupTo && new Date(b.startAt) > new Date(`${filters.pickupTo}T23:59:59`)) return false;

    if (
      query &&
      !(
        b.customerName.toLowerCase().includes(query) ||
        b.customerPhone.toLowerCase().includes(query) ||
        b.carName.toLowerCase().includes(query)
      )
    ) {
      return false;
    }

    return true;
  });
}

function BookingsPanel() {
  const { token, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_BOOKING_FILTERS);

  useEffect(() => {
    let cancelledRequest = false;
    // Standard fetch-on-mount pattern (react.dev/learn/synchronizing-with-effects).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    fetchAdminBookings(token)
      .then((data) => {
        if (!cancelledRequest) setBookings(data);
      })
      .catch((err) => {
        if (cancelledRequest) return;
        if (err.status === 401) {
          logout();
          return;
        }
        setError(err.message || 'Failed to load bookings');
      })
      .finally(() => {
        if (!cancelledRequest) setLoading(false);
      });

    return () => {
      cancelledRequest = true;
    };
  }, [token, logout]);

  async function handleCancel(booking) {
    if (!window.confirm(`Cancel this booking for ${booking.customerName}? The date will become available again.`)) {
      return;
    }
    setActionError('');
    try {
      const updated = await cancelBooking(token, booking.id);
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, ...updated } : b)));
    } catch (err) {
      if (err.status === 401) return logout();
      setActionError(err.message || 'Could not cancel booking');
    }
  }

  async function handleUploadReceipt(booking, file) {
    if (!file) return;
    setActionError('');
    setUploadingId(booking.id);
    try {
      const updated = await uploadBookingReceipt(token, booking.id, file);
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, ...updated } : b)));
    } catch (err) {
      if (err.status === 401) return logout();
      setActionError(err.message || 'Could not upload receipt');
    } finally {
      setUploadingId(null);
    }
  }

  // Distinct cars appearing in the bookings list, for the car filter —
  // avoids a second API call just to populate this dropdown.
  const cars = useMemo(() => {
    const byId = new Map();
    for (const b of bookings) {
      if (!byId.has(b.carId)) byId.set(b.carId, { id: b.carId, name: b.carName });
    }
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings]);

  // Bookings already arrive sorted newest-created-first from the API —
  // filtering with .filter() preserves that order, so no separate sort
  // step is needed here.
  const filtered = useMemo(() => applyFilters(bookings, filters), [bookings, filters]);

  // Only count confirmed (paid), non-cancelled bookings — pending hasn't
  // been paid yet, and cancelled shouldn't count as revenue at all.
  const confirmedRevenue = filtered
    .filter((b) => b.status === 'booked')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  // Non-cancelled bookings whose pick-up is still ahead of now.
  const upcomingCount = filtered.filter((b) => b.status !== 'cancelled' && new Date(b.startAt) > new Date()).length;

  // Distinct cars with at least one non-cancelled booking in the current view.
  const carsBookedCount = new Set(filtered.filter((b) => b.status !== 'cancelled').map((b) => b.carId)).size;

  return (
    <div className="bookings-page">
      <div className="panel">
        <BookingsFilters filters={filters} onChange={setFilters} cars={cars} />
      </div>

      <div className="kpi-strip">
        <div className="kpi-strip-item">
          <span className="kpi-icon kpi-icon-ink">
            <CalendarIcon />
          </span>
          <div>
            <div className="kpi-value">{filtered.length}</div>
            <div className="kpi-label">Total bookings</div>
          </div>
        </div>
        <div className="kpi-strip-item">
          <span className="kpi-icon kpi-icon-jade">
            <CheckCircleIcon />
          </span>
          <div>
            <div className="kpi-value">RM{confirmedRevenue}</div>
            <div className="kpi-label">Confirmed revenue</div>
          </div>
        </div>
        <div className="kpi-strip-item">
          <span className="kpi-icon kpi-icon-amber">
            <ClockIcon />
          </span>
          <div>
            <div className="kpi-value">{upcomingCount}</div>
            <div className="kpi-label">Upcoming bookings</div>
          </div>
        </div>
        <div className="kpi-strip-item">
          <span className="kpi-icon kpi-icon-ink">
            <CarIcon />
          </span>
          <div>
            <div className="kpi-value">{carsBookedCount}</div>
            <div className="kpi-label">Cars booked</div>
          </div>
        </div>
      </div>

      {actionError && <p className="form-error">{actionError}</p>}

      {loading && <p className="state-message">Loading bookings…</p>}
      {error && <p className="state-message state-error">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="state-message">
          {bookings.length === 0 ? 'No bookings yet.' : 'No bookings match your filters.'}
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="panel">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Car</th>
                  <th>Pick-up</th>
                  <th>Return</th>
                  <th>Duration</th>
                  <th>Total</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Receipt</th>
                  <th>Booked on</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span className={`status-badge status-${b.status}`}>{STATUS_LABELS[b.status]}</span>
                    </td>
                    <td>{b.carName}</td>
                    <td>{formatDateTime(b.startAt)}</td>
                    <td>{formatDateTime(b.endAt)}</td>
                    <td className="table-muted">{durationLabel(b.startAt, b.endAt)}</td>
                    <td>RM{b.totalPrice}</td>
                    <td>{b.customerName}</td>
                    <td>
                      <a href={`tel:${b.customerPhone}`}>{b.customerPhone}</a>
                    </td>
                    <td>
                      {b.receiptUrl ? (
                        <a href={b.receiptUrl} target="_blank" rel="noreferrer">
                          View
                        </a>
                      ) : b.status === 'pending' ? (
                        <label className="btn btn-outline btn-sm">
                          {uploadingId === b.id ? 'Uploading…' : 'Upload receipt'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: 'none' }}
                            disabled={uploadingId === b.id}
                            onChange={(e) => handleUploadReceipt(b, e.target.files?.[0])}
                          />
                        </label>
                      ) : (
                        <span className="table-muted">—</span>
                      )}
                    </td>
                    <td className="table-muted">{formatDateTime(b.createdAt)}</td>
                    <td>
                      {b.status !== 'cancelled' && (
                        <button className="btn btn-outline btn-sm btn-danger" onClick={() => handleCancel(b)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingsPanel;

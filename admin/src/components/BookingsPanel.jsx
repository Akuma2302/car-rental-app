import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchAdminBookings, cancelBooking, uploadBookingReceipt } from '../services/bookingService.js';
import { fetchCars } from '../services/carService.js';
import { formatDateTime } from '../utils/date.js';
import BookingsFilters, { DEFAULT_BOOKING_FILTERS, getDurationBand } from './BookingsFilters.jsx';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CarIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  UserIcon,
  UploadIcon,
} from './icons.jsx';

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
  const [sortOrder, setSortOrder] = useState('latest');
  const [carDetails, setCarDetails] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);

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

    // Fetches once for the car photo/category shown on mobile cards and
    // the detail view — the bookings list itself only carries carId/carName.
    fetchCars(token)
      .then((data) => {
        if (cancelledRequest) return;
        const byId = {};
        for (const c of data) byId[c.id] = c;
        setCarDetails(byId);
      })
      .catch(() => {
        // Non-critical — cards/detail just fall back to no photo.
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
      setSelectedBooking((prev) => (prev && prev.id === booking.id ? { ...prev, ...updated } : prev));
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
      setSelectedBooking((prev) => (prev && prev.id === booking.id ? { ...prev, ...updated } : prev));
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
  // step is needed unless the admin has chosen "Oldest first".
  const filtered = useMemo(() => applyFilters(bookings, filters), [bookings, filters]);
  const sorted = useMemo(
    () => (sortOrder === 'oldest' ? [...filtered].reverse() : filtered),
    [filtered, sortOrder]
  );

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
        <>
          <div className="bookings-list-head">
            <span className="bookings-list-count">{filtered.length} bookings found</span>
            <select
              className="filter-select sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              aria-label="Sort bookings"
            >
              <option value="latest">Latest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {/* Card list — shown on mobile only (CSS-controlled); same data,
              actions, and handlers as the table below. */}
          <div className="booking-cards">
            {sorted.map((b) => {
              const car = carDetails[b.carId];
              const photo = car?.images?.[0]?.url;
              return (
                <button key={b.id} type="button" className="booking-card" onClick={() => setSelectedBooking(b)}>
                  <div className="booking-card-top">
                    <span className={`status-badge status-${b.status}`}>{STATUS_LABELS[b.status]}</span>
                  </div>
                  <div className="booking-card-body">
                    {photo ? (
                      <img className="booking-card-thumb" src={photo} alt="" />
                    ) : (
                      <span className="booking-card-thumb booking-card-thumb-empty">
                        <CarIcon />
                      </span>
                    )}
                    <div className="booking-card-info">
                      <h4>{b.carName}</h4>
                      <div className="booking-card-dates">
                        <span>{formatDateTime(b.startAt)}</span>
                        <span>{formatDateTime(b.endAt)}</span>
                      </div>
                      <div className="booking-card-price">RM{b.totalPrice}</div>
                    </div>
                    <ChevronRightIcon className="booking-card-chevron" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Table — shown on desktop only (CSS-controlled). */}
          <div className="panel booking-table-panel">
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
                  {sorted.map((b) => (
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
        </>
      )}

      {selectedBooking && (
        <BookingDetailOverlay
          booking={selectedBooking}
          car={carDetails[selectedBooking.carId]}
          uploading={uploadingId === selectedBooking.id}
          onClose={() => setSelectedBooking(null)}
          onCancel={() => handleCancel(selectedBooking)}
          onUploadReceipt={(file) => handleUploadReceipt(selectedBooking, file)}
        />
      )}
    </div>
  );
}

function BookingDetailOverlay({ booking, car, uploading, onClose, onCancel, onUploadReceipt }) {
  const photo = car?.images?.[0]?.url;
  const shortId = booking.id.slice(0, 8).toUpperCase();

  return (
    <div className="booking-detail-overlay">
      <header className="booking-detail-head">
        <button type="button" className="booking-detail-back" onClick={onClose} aria-label="Back to bookings">
          <ArrowLeftIcon />
        </button>
        <h2>Booking Details</h2>
      </header>

      <div className="booking-detail-body">
        <div className="booking-detail-status-row">
          <span className={`status-badge status-${booking.status}`}>{STATUS_LABELS[booking.status]}</span>
          <div className="booking-detail-id">
            <span>Booking ID</span>
            <b>#{shortId}</b>
          </div>
        </div>

        <div className="booking-detail-car">
          {photo ? (
            <img src={photo} alt="" />
          ) : (
            <span className="booking-detail-car-fallback">
              <CarIcon />
            </span>
          )}
          <div>
            <h3>{booking.carName}</h3>
            {car?.tagline && <p>{car.tagline}</p>}
            {car?.category && <span className="badge">{car.category}</span>}
          </div>
        </div>

        <div className="booking-detail-rows">
          <div className="booking-detail-row">
            <CalendarIcon />
            <div>
              <span>Pick-up Date &amp; Time</span>
              <b>{formatDateTime(booking.startAt)}</b>
            </div>
          </div>
          <div className="booking-detail-row">
            <CalendarIcon />
            <div>
              <span>Return Date &amp; Time</span>
              <b>{formatDateTime(booking.endAt)}</b>
            </div>
          </div>
          <div className="booking-detail-row">
            <ClockIcon />
            <div>
              <span>Duration</span>
              <b>{durationLabel(booking.startAt, booking.endAt)}</b>
            </div>
          </div>
          <div className="booking-detail-row">
            <CheckCircleIcon />
            <div>
              <span>Total</span>
              <b>RM{booking.totalPrice}</b>
            </div>
          </div>
        </div>

        <div className="booking-detail-customer">
          <span className="booking-detail-customer-avatar">
            <UserIcon />
          </span>
          <div>
            <span>Customer</span>
            <b>{booking.customerName}</b>
            <a href={`tel:${booking.customerPhone}`}>{booking.customerPhone}</a>
          </div>
        </div>

        {(booking.customerIc || booking.customerAddress) && (
          <div className="booking-detail-extra">
            {booking.customerIc && (
              <p>
                <span>IC:</span> {booking.customerIc}
              </p>
            )}
            {booking.customerAddress && (
              <p>
                <span>Address:</span> {booking.customerAddress}, {booking.customerPostcode} {booking.customerCity},{' '}
                {booking.customerState}
              </p>
            )}
          </div>
        )}

        {booking.receiptUrl ? (
          <a className="btn btn-outline" href={booking.receiptUrl} target="_blank" rel="noreferrer">
            View receipt
          </a>
        ) : booking.status === 'pending' ? (
          <label className="btn btn-primary booking-detail-upload">
            <UploadIcon width={16} height={16} />
            {uploading ? 'Uploading…' : 'Upload Receipt'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              disabled={uploading}
              onChange={(e) => onUploadReceipt(e.target.files?.[0])}
            />
          </label>
        ) : null}

        {booking.status !== 'cancelled' && (
          <button type="button" className="btn btn-outline btn-danger booking-detail-cancel" onClick={onCancel}>
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
}

export default BookingsPanel;

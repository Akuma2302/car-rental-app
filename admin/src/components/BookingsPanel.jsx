import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchAdminBookings } from '../services/bookingService.js';
import { formatDateTime } from '../utils/date.js';

function durationLabel(startAt, endAt) {
  const hours = (new Date(endAt) - new Date(startAt)) / (1000 * 60 * 60);
  if (hours < 24) return `${Math.round(hours * 10) / 10}h`;
  const days = Math.floor(hours / 24);
  const rem = Math.round(hours % 24);
  return rem > 0 ? `${days}d ${rem}h` : `${days}d`;
}

function BookingsPanel() {
  const { token, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    // Standard fetch-on-mount pattern (react.dev/learn/synchronizing-with-effects).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    fetchAdminBookings(token)
      .then((data) => {
        if (!cancelled) setBookings(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) {
          logout();
          return;
        }
        setError(err.message || 'Failed to load bookings');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const query = search.trim().toLowerCase();
  const filtered = query
    ? bookings.filter(
        (b) =>
          b.customerName.toLowerCase().includes(query) ||
          b.customerPhone.toLowerCase().includes(query) ||
          b.carName.toLowerCase().includes(query)
      )
    : bookings;

  const totalRevenue = filtered.reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="panel">
      <div className="panel-toolbar">
        <input
          type="text"
          placeholder="Search by name, phone, or car…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <span className="panel-count">
          {filtered.length} booking{filtered.length === 1 ? '' : 's'} · RM{totalRevenue} total
        </span>
      </div>

      {loading && <p className="state-message">Loading bookings…</p>}
      {error && <p className="state-message state-error">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="state-message">
          {bookings.length === 0 ? 'No bookings yet.' : 'No bookings match your search.'}
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Car</th>
                <th>Pick-up</th>
                <th>Return</th>
                <th>Duration</th>
                <th>Total</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Booked on</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>{b.carName}</td>
                  <td>{formatDateTime(b.startAt)}</td>
                  <td>{formatDateTime(b.endAt)}</td>
                  <td className="table-muted">{durationLabel(b.startAt, b.endAt)}</td>
                  <td>RM{b.totalPrice}</td>
                  <td>{b.customerName}</td>
                  <td>
                    <a href={`tel:${b.customerPhone}`}>{b.customerPhone}</a>
                  </td>
                  <td className="table-muted">{formatDateTime(b.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BookingsPanel;

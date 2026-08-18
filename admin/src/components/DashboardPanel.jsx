import { useAuth } from '../context/AuthContext.jsx';
import { useDashboard } from '../hooks/useDashboard.js';
import { formatDateTime } from '../utils/date.js';

function greetingForHour(hour) {
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function DashboardPanel({ onNavigate }) {
  const { token, logout, username } = useAuth();
  const { data, loading, error } = useDashboard(token, logout);

  if (loading) return <p className="state-message">Loading dashboard…</p>;
  if (error) return <p className="state-message state-error">{error}</p>;
  if (!data) return null;

  const {
    fleetStatus,
    todaySchedule,
    pendingPayments,
    revenueThisWeek,
    newBookingsCount,
    awaitingReceiptCount,
    upcomingBookings,
    revenueByDay,
    bookingStatusBreakdown,
    recentBookings,
  } = data;

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Today's pickups and drop-offs merged into one time-ordered list.
  const todayCombined = [
    ...todaySchedule.pickupsToday.map((b) => ({ ...b, type: 'Pickup', time: b.startAt })),
    ...todaySchedule.dropoffsToday.map((b) => ({ ...b, type: 'Return', time: b.endAt })),
  ].sort((a, b) => new Date(a.time) - new Date(b.time));

  const maxDayRevenue = Math.max(1, ...revenueByDay.map((d) => d.revenue));
  const totalStatusBookings = Math.max(
    1,
    bookingStatusBreakdown.pending + bookingStatusBreakdown.booked + bookingStatusBreakdown.cancelled
  );

  return (
    <div className="dashboard-panels">
      <div className="dash-greeting">
        <h2>
          {greetingForHour(now.getHours())}, {username}
        </h2>
        <p>{dateLabel}</p>
      </div>

      <div className="kpi-strip">
        <div className="kpi-strip-item">
          <span className="kpi-icon kpi-icon-amber">🟡</span>
          <div>
            <div className="kpi-value">{pendingPayments}</div>
            <div className="kpi-label">Pending</div>
          </div>
        </div>
        <div className="kpi-strip-item">
          <span className="kpi-icon kpi-icon-ink">🚗</span>
          <div>
            <div className="kpi-value">{todaySchedule.pickupsToday.length}</div>
            <div className="kpi-label">Pickups today</div>
          </div>
        </div>
        <div className="kpi-strip-item">
          <span className="kpi-icon kpi-icon-ink">🔄</span>
          <div>
            <div className="kpi-value">{todaySchedule.dropoffsToday.length}</div>
            <div className="kpi-label">Returns today</div>
          </div>
        </div>
        <div className="kpi-strip-item">
          <span className="kpi-icon kpi-icon-jade">💰</span>
          <div>
            <div className="kpi-value">RM{revenueThisWeek}</div>
            <div className="kpi-label">Revenue (7 days)</div>
          </div>
        </div>
      </div>

      <div className="dash-two-col">
        <div className="panel">
          <h3 className="panel-heading">⚠️ Requires Attention</h3>
          <ul className="attention-list">
            <li>
              <span>New Booking</span>
              <b>{newBookingsCount}</b>
            </li>
            <li>
              <span>Awaiting Receipt</span>
              <b>{awaitingReceiptCount}</b>
            </li>
            <li>
              <span>Overdue Returns</span>
              <b>{todaySchedule.overdue.length}</b>
            </li>
          </ul>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => onNavigate?.('bookings')}>
            View All
          </button>
        </div>

        <div className="panel">
          <h3 className="panel-heading">🚗 Fleet Status</h3>
          <ul className="attention-list">
            <li>
              <span>Available</span>
              <b className="text-jade">{fleetStatus.available}</b>
            </li>
            <li>
              <span>Rented</span>
              <b className="text-amber">{fleetStatus.onRoad}</b>
            </li>
            <li>
              <span>Maintenance</span>
              <b className="text-coral">{fleetStatus.maintenance}</b>
            </li>
          </ul>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => onNavigate?.('cars')}>
            Manage Fleet
          </button>
        </div>
      </div>

      <div className="panel">
        <h3 className="panel-heading">🚗 Today's Pickup &amp; Return</h3>
        {todayCombined.length === 0 ? (
          <p className="state-message">Nothing scheduled today.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Car</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayCombined.map((b) => (
                  <tr key={`${b.id}-${b.type}`}>
                    <td>{formatDateTime(b.time)}</td>
                    <td>{b.carName}</td>
                    <td>{b.customerName}</td>
                    <td>{b.type}</td>
                    <td>
                      <span className={`status-badge status-${b.status}`}>
                        {b.status === 'booked' ? 'Confirmed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel">
        <h3 className="panel-heading">📅 Upcoming Bookings (Next 7 Days)</h3>
        {upcomingBookings.length === 0 ? (
          <p className="state-message">No bookings coming up in the next 7 days.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pick-up</th>
                  <th>Car</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingBookings.map((b) => (
                  <tr key={b.id}>
                    <td>{formatDateTime(b.startAt)}</td>
                    <td>{b.carName}</td>
                    <td>{b.customerName}</td>
                    <td>RM{b.totalPrice}</td>
                    <td>
                      <span className={`status-badge status-${b.status}`}>
                        {b.status === 'booked' ? 'Confirmed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dash-two-col">
        <div className="panel">
          <h3 className="panel-heading">💰 Revenue — Last 7 Days</h3>
          <div className="revenue-chart">
            {revenueByDay.map((d) => (
              <div className="revenue-bar-col" key={d.date}>
                <div className="revenue-bar-track">
                  <div
                    className="revenue-bar-fill"
                    style={{ height: `${Math.max(4, (d.revenue / maxDayRevenue) * 100)}%` }}
                    title={`RM${d.revenue}`}
                  />
                </div>
                <span className="revenue-bar-value">{d.revenue > 0 ? `RM${d.revenue}` : ''}</span>
                <span className="revenue-bar-label">
                  {new Date(d.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-heading">📋 Booking Status</h3>
          <div className="status-breakdown">
            <div className="status-breakdown-bar">
              <span
                className="status-breakdown-seg status-breakdown-jade"
                style={{ width: `${(bookingStatusBreakdown.booked / totalStatusBookings) * 100}%` }}
              />
              <span
                className="status-breakdown-seg status-breakdown-amber"
                style={{ width: `${(bookingStatusBreakdown.pending / totalStatusBookings) * 100}%` }}
              />
              <span
                className="status-breakdown-seg status-breakdown-coral"
                style={{ width: `${(bookingStatusBreakdown.cancelled / totalStatusBookings) * 100}%` }}
              />
            </div>
            <ul className="attention-list">
              <li>
                <span>
                  <i className="status-dot status-dot-jade" /> Confirmed
                </span>
                <b>{bookingStatusBreakdown.booked}</b>
              </li>
              <li>
                <span>
                  <i className="status-dot status-dot-amber" /> Pending
                </span>
                <b>{bookingStatusBreakdown.pending}</b>
              </li>
              <li>
                <span>
                  <i className="status-dot status-dot-coral" /> Cancelled
                </span>
                <b>{bookingStatusBreakdown.cancelled}</b>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3 className="panel-heading">📋 Recent Bookings</h3>
        {recentBookings.length === 0 ? (
          <p className="state-message">No bookings yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Car</th>
                  <th>Pick-up</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.customerName}</td>
                    <td>{b.carName}</td>
                    <td>{formatDateTime(b.startAt)}</td>
                    <td>RM{b.totalPrice}</td>
                    <td>
                      <span className={`status-badge status-${b.status}`}>
                        {b.status === 'booked' ? 'Confirmed' : b.status === 'pending' ? 'Pending' : 'Cancelled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPanel;

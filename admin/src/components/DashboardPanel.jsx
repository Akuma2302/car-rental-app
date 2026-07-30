import { useAuth } from '../context/AuthContext.jsx';
import { useDashboard } from '../hooks/useDashboard.js';
import { formatDateTime } from '../utils/date.js';

function StatCard({ label, value, accent }) {
  return (
    <div className={`stat-card${accent ? ` stat-card-${accent}` : ''}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function DashboardPanel() {
  const { token, logout } = useAuth();
  const { data, loading, error } = useDashboard(token, logout);

  if (loading) return <p className="state-message">Loading dashboard…</p>;
  if (error) return <p className="state-message state-error">{error}</p>;
  if (!data) return null;

  return (
    <div className="dashboard-panels">
      <div className="stat-grid">
        <StatCard label="Total cars" value={data.totalCars} />
        <StatCard label="On rent right now" value={data.carsOnRentNow} accent="amber" />
        <StatCard label="Available right now" value={data.carsAvailableNow} accent="jade" />
        <StatCard label="Bookings this week" value={data.bookingsThisWeek} />
        <StatCard label="Revenue this week" value={`RM${data.revenueThisWeek}`} accent="jade" />
        <StatCard label="Bookings all-time" value={data.totalBookings} />
      </div>

      <div className="panel">
        <h3 className="panel-heading">Currently out on rent</h3>
        {data.activeRentals.length === 0 ? (
          <p className="state-message">No cars are out right now — the whole fleet is available.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Car</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Due back</th>
                </tr>
              </thead>
              <tbody>
                {data.activeRentals.map((b) => (
                  <tr key={b.id}>
                    <td>{b.carName}</td>
                    <td>{b.customerName}</td>
                    <td>
                      <a href={`tel:${b.customerPhone}`}>{b.customerPhone}</a>
                    </td>
                    <td>{formatDateTime(b.endAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel">
        <h3 className="panel-heading">Fleet at a glance</h3>
        <div className="fleet-glance">
          {data.fleet.map((car) => (
            <div key={car.id} className={`fleet-chip${car.onRentNow ? ' fleet-chip-busy' : ''}`}>
              <span className="fleet-chip-dot" />
              <span>{car.name}</span>
              <span className="table-muted">{car.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPanel;

import { useAuth } from '../context/AuthContext.jsx';
import { useDashboard } from '../hooks/useDashboard.js';
import { formatDateTime } from '../utils/date.js';

function StatCard({ label, value, accent, hint }) {
  return (
    <div className={`stat-card${accent ? ` stat-card-${accent}` : ''}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  );
}

function ScheduleTable({ title, bookings, emptyText, showOverdueTag }) {
  return (
    <div className="panel">
      <h3 className="panel-heading">{title}</h3>
      {bookings.length === 0 ? (
        <p className="state-message">{emptyText}</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Car</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Time</th>
                {showOverdueTag && <th />}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.carName}</td>
                  <td>{b.customerName}</td>
                  <td>
                    <a href={`tel:${b.customerPhone}`}>{b.customerPhone}</a>
                  </td>
                  <td>{formatDateTime(showOverdueTag ? b.endAt : b.startAt || b.endAt)}</td>
                  {showOverdueTag && (
                    <td>
                      <span className="status-badge status-pending">Overdue</span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DashboardPanel() {
  const { token, logout } = useAuth();
  const { data, loading, error } = useDashboard(token, logout);

  if (loading) return <p className="state-message">Loading dashboard…</p>;
  if (error) return <p className="state-message state-error">{error}</p>;
  if (!data) return null;

  const { fleetStatus, todaySchedule, kpis } = data;

  return (
    <div className="dashboard-panels">
      <section>
        <h3 className="panel-heading">Fleet status & availability</h3>
        <div className="stat-grid">
          <StatCard label="Total fleet" value={fleetStatus.totalFleet} />
          <StatCard label="Rented / on road" value={fleetStatus.onRoad} accent="amber" />
          <StatCard label="Available now" value={fleetStatus.available} accent="jade" />
          <StatCard label="In maintenance" value={fleetStatus.maintenance} accent="coral" />
          <StatCard label="Reserved / upcoming" value={fleetStatus.reserved} />
        </div>
      </section>

      <section>
        <h3 className="panel-heading">This week</h3>
        <div className="stat-grid">
          <StatCard label="Awaiting payment" value={data.pendingPayments} accent="amber" />
          <StatCard label="Bookings this week" value={data.bookingsThisWeek} />
          <StatCard label="Confirmed revenue this week" value={`RM${data.revenueThisWeek}`} accent="jade" />
          <StatCard label="Bookings all-time" value={data.totalBookings} />
        </div>
      </section>

      <section>
        <h3 className="panel-heading">Performance — last {kpis.windowDays} days</h3>
        <div className="stat-grid">
          <StatCard label="Utilization rate" value={`${kpis.utilizationRate}%`} hint="Days rented ÷ available vehicle days" />
          <StatCard label="Average daily rate" value={`RM${kpis.averageDailyRate}`} hint="Revenue ÷ days rented" />
          <StatCard label="RevPAC" value={`RM${kpis.revPac}`} hint="Revenue ÷ total fleet size" />
          <StatCard
            label="Avg. idle time between bookings"
            value={kpis.averageIdleHours === null ? '—' : `${kpis.averageIdleHours}h`}
            hint="All-time, per car"
          />
        </div>
      </section>

      {todaySchedule.overdue.length > 0 && (
        <ScheduleTable
          title="Overdue returns"
          bookings={todaySchedule.overdue}
          emptyText=""
          showOverdueTag
        />
      )}

      <div className="dash-two-col">
        <ScheduleTable
          title="Today's pick-ups"
          bookings={todaySchedule.pickupsToday}
          emptyText="No pick-ups scheduled today."
        />
        <ScheduleTable
          title="Today's drop-offs"
          bookings={todaySchedule.dropoffsToday}
          emptyText="No drop-offs scheduled today."
        />
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
                  <th>Status</th>
                  <th>Car</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Due back</th>
                </tr>
              </thead>
              <tbody>
                {data.activeRentals.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span className={`status-badge status-${b.status}`}>
                        {b.status === 'booked' ? 'Booked' : 'Pending'}
                      </span>
                    </td>
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
            <div
              key={car.id}
              className={`fleet-chip${car.onRentNow ? ' fleet-chip-busy' : ''}${!car.isActive ? ' fleet-chip-inactive' : ''}`}
            >
              <span className="fleet-chip-dot" />
              <span>{car.name}</span>
              <span className="table-muted">
                {car.condition !== 'in_service' ? car.condition : car.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPanel;

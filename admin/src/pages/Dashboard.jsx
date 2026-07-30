import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { businessName } from '../utils/siteConfig.js';
import DashboardPanel from '../components/DashboardPanel.jsx';
import BookingsPanel from '../components/BookingsPanel.jsx';
import CarsPanel from '../components/CarsPanel.jsx';

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'cars', label: 'Cars' },
];

function Dashboard() {
  const { username, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-title">
          <span className="logo-dot" />
          {businessName} Admin
        </div>
        <div className="dash-user">
          <span>Signed in as {username}</span>
          <button className="btn btn-outline btn-sm" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <nav className="dash-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`dash-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="dash-content">
        {tab === 'dashboard' && <DashboardPanel />}
        {tab === 'bookings' && <BookingsPanel />}
        {tab === 'cars' && <CarsPanel />}
      </main>
    </div>
  );
}

export default Dashboard;

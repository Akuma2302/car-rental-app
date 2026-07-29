import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { businessName } from '../utils/siteConfig.js';
import BookingsPanel from '../components/BookingsPanel.jsx';
import CarsPanel from '../components/CarsPanel.jsx';

function Dashboard() {
  const { username, logout } = useAuth();
  const [tab, setTab] = useState('bookings');

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
        <button
          type="button"
          className={`dash-tab${tab === 'bookings' ? ' active' : ''}`}
          onClick={() => setTab('bookings')}
        >
          Bookings
        </button>
        <button
          type="button"
          className={`dash-tab${tab === 'cars' ? ' active' : ''}`}
          onClick={() => setTab('cars')}
        >
          Cars
        </button>
      </nav>

      <main className="dash-content">{tab === 'bookings' ? <BookingsPanel /> : <CarsPanel />}</main>
    </div>
  );
}

export default Dashboard;

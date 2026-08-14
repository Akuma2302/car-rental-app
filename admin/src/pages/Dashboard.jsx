import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { businessName } from '../utils/siteConfig.js';
import DashboardPanel from '../components/DashboardPanel.jsx';
import BookingsPanel from '../components/BookingsPanel.jsx';
import CarsPanel from '../components/CarsPanel.jsx';
import { GridIcon, CalendarIcon, CarIcon, LogoutIcon, MenuIcon, CloseIcon } from '../components/icons.jsx';

const TABS = [
  { key: 'dashboard', icon: GridIcon, label: 'Dashboard', subtitle: 'Overview of your fleet and bookings' },
  { key: 'bookings', icon: CalendarIcon, label: 'Bookings', subtitle: 'Manage and monitor all car rental bookings' },
  { key: 'cars', icon: CarIcon, label: 'Cars', subtitle: 'Manage your fleet listings and availability' },
];

function Dashboard() {
  const { username, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const active = TABS.find((t) => t.key === tab);

  function selectTab(key) {
    setTab(key);
    setMenuOpen(false);
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar${menuOpen ? ' menu-open' : ''}`}>
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-logo">
            <span className="logo-dot" />
            {businessName}
            <span className="admin-sidebar-logo-tag">ADMIN</span>
          </div>
          <button
            type="button"
            className="admin-menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? <CloseIcon width={18} height={18} /> : <MenuIcon width={18} height={18} />}
          </button>
        </div>

        <nav className="admin-nav">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`admin-nav-item${tab === t.key ? ' active' : ''}`}
              onClick={() => selectTab(t.key)}
            >
              <t.icon />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-chip">
            <span className="admin-user-avatar">{username?.[0]?.toUpperCase() || 'A'}</span>
            <div>
              <div className="admin-user-name">{username}</div>
              <div className="admin-user-role">Administrator</div>
            </div>
          </div>
          <button type="button" className="admin-logout-btn" onClick={logout}>
            <LogoutIcon width={16} height={16} />
            Log out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <h1>{active.label}</h1>
          <p>{active.subtitle}</p>
        </header>

        <main className="admin-content">
          {tab === 'dashboard' && <DashboardPanel />}
          {tab === 'bookings' && <BookingsPanel />}
          {tab === 'cars' && <CarsPanel />}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

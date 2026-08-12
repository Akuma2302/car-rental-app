import { useState } from 'react';
import { siteConfig } from '../utils/siteConfig.js';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="nav">
      <div className="nav-inner liquid-glass">
        <div className="logo">
          <span className="logo-dot" />
          {siteConfig.businessName}
        </div>

        <nav className="nav-links">
          <a href="#cars">Cars</a>
          <a href="#why-us">Why us</a>
          <a href="#location">Location</a>
        </nav>

        <div className="nav-right">
          <a className="nav-call" href={siteConfig.phoneHref}>
            {siteConfig.phoneDisplay}
          </a>
          <a className="btn btn-primary btn-sm nav-cta" href="#cars">
            Book Now
          </a>
          <button
            type="button"
            className="nav-menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="nav-links-mobile">
          <a href="#cars" onClick={() => setMenuOpen(false)}>
            Cars
          </a>
          <a href="#why-us" onClick={() => setMenuOpen(false)}>
            Why us
          </a>
          <a href="#location" onClick={() => setMenuOpen(false)}>
            Location
          </a>
        </nav>
      )}
    </header>
  );
}

export default Header;

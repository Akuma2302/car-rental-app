import { siteConfig } from '../utils/siteConfig.js';

function Header() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="logo">
          <span className="logo-dot" />
          {siteConfig.businessName}
        </div>
        <nav className="nav-links">
          <a href="#cars">Cars</a>
          <a href="#why-us">Why us</a>
          <a href="#location">Location</a>
        </nav>
        <a className="nav-call" href={siteConfig.phoneHref}>
          {siteConfig.phoneDisplay}
        </a>
      </div>
    </header>
  );
}

export default Header;

import { siteConfig } from '../utils/siteConfig.js';
import { FacebookIcon, InstagramIcon, TiktokIcon, PhoneIcon } from '../components/icons.jsx';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-dot" />
              {siteConfig.businessName}
            </div>
            <p>Self-drive car rental with real-time booking. Pick a car, pick a time, hit the road.</p>
          </div>

          <div>
            <h4>Address</h4>
            <address>
              {siteConfig.address.line1}
              <br />
              {siteConfig.address.line2}
              <br />
              {siteConfig.address.line3}
            </address>
          </div>

          <div>
            <h4>Follow</h4>
            <div className="social-row">
              <a href={siteConfig.social.facebook} aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href={siteConfig.social.instagram} aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href={siteConfig.social.tiktok} aria-label="TikTok">
                <TiktokIcon />
              </a>
            </div>
          </div>

          <div>
            <h4>Talk to us</h4>
            <a className="footer-phone" href={siteConfig.phoneHref}>
              <PhoneIcon width={14} height={14} />
              {siteConfig.phoneDisplay}
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {year} {siteConfig.businessName}. All rights reserved.
          </span>
          <span>Built with care for the road ahead.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

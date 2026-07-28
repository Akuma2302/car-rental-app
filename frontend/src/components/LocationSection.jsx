import { siteConfig } from '../utils/siteConfig.js';
import { PinIcon, ClockIcon, PhoneIcon } from './icons.jsx';

function LocationSection() {
  return (
    <section className="location reveal" id="location">
      <div className="container">
        <div className="location-grid">
          <div className="location-info">
            <span className="eyebrow location-eyebrow">Find us</span>
            <h2 className="location-title">Come say hi</h2>
            <p>Swing by during counter hours or message us anytime to arrange a meet-up point.</p>

            <div className="location-detail">
              <PinIcon />
              <div>
                <b>Address</b>
                <span>
                  {siteConfig.address.line1}, {siteConfig.address.line2}, {siteConfig.address.line3}
                </span>
              </div>
            </div>
            <div className="location-detail">
              <ClockIcon width={18} height={18} />
              <div>
                <b>Hours</b>
                <span>{siteConfig.hours}</span>
              </div>
            </div>
            <div className="location-detail">
              <PhoneIcon />
              <div>
                <b>Phone</b>
                <span>{siteConfig.phoneDisplay}</span>
              </div>
            </div>
          </div>

          <div className="map-frame">
            <iframe
              src={siteConfig.mapEmbedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Our location"
            />
            <div className="map-note">
              ⚠ placeholder map — update <code>mapEmbedSrc</code> in <code>utils/siteConfig.js</code> with your
              real address
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LocationSection;

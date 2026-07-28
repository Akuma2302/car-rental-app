import { siteConfig } from '../utils/siteConfig.js';
import Button from './Button.jsx';

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-glow" />
      <div className="hero-inner">
        <h1>
          Pick a car.
          <br />
          Pick a time.
          <br />
          <span className="accent">Hit the road.</span>
        </h1>
        <p>
          Real-time availability and instant WhatsApp confirmation — no phone tag, no waiting for a
          callback. See what&rsquo;s free right now and lock it in.
        </p>
        <div className="hero-actions">
          <Button as="a" href="#cars" variant="primary">
            See available cars
          </Button>
          <Button as="a" href={siteConfig.phoneHref} variant="ghost">
            Call {siteConfig.phoneDisplay}
          </Button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <b>24/7</b>
            <span>Real-time booking</span>
          </div>
          <div className="hero-stat">
            <b>7am–10pm</b>
            <span>Counter hours</span>
          </div>
          <div className="hero-stat">
            <b>100%</b>
            <span>Cars stocked with snacks</span>
          </div>
        </div>
      </div>
      <svg className="road" viewBox="0 0 1200 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0 C 300 64, 900 64, 1200 0 L1200 64 L0 64 Z" fill="var(--stone)" />
        <line x1="0" y1="40" x2="1200" y2="40" stroke="#fff" strokeOpacity=".25" strokeWidth="3" strokeDasharray="22 18" />
      </svg>
    </section>
  );
}

export default Hero;

import { siteConfig } from '../utils/siteConfig.js';
import Button from './Button.jsx';
import AnimatedHeading from './AnimatedHeading.jsx';
import FadeIn from './FadeIn.jsx';

// Free-to-use stock footage (Pexels License — free for commercial use, no
// attribution required): https://www.pexels.com/video/driving-at-night-in-a-highway-5938339/
// Native 1920x1080 landscape — avoids the heavy upscale/crop that a portrait
// source gets under object-fit: cover on a wide hero.
const HERO_VIDEO_URL = 'https://videos.pexels.com/video-files/5938339/5938339-hd_1920_1080_25fps.mp4';

function Hero() {
  return (
    <section className="hero" id="top">
      <video className="hero-video" src={HERO_VIDEO_URL} autoPlay loop muted playsInline />

      <div className="hero-inner">
        <div className="hero-main">
          <AnimatedHeading text={'Pick a car.\nPick a time.\nHit the road.'} accentLine={2} />

          <FadeIn delay={800} duration={1000}>
            <p>
              Real-time availability and instant WhatsApp confirmation — no phone tag, no waiting for a
              callback. See what&rsquo;s free right now and lock it in.
            </p>
          </FadeIn>

          <FadeIn delay={1200} duration={1000}>
            <div className="hero-actions">
              <Button as="a" href="#cars" variant="primary">
                See available cars
              </Button>
              <Button as="a" href={siteConfig.phoneHref} variant="ghost">
                Call {siteConfig.phoneDisplay}
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={1600} duration={1000}>
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
          </FadeIn>
        </div>

        <div className="hero-tag-col">
          <FadeIn delay={1400} duration={1000}>
            <div className="hero-tag liquid-glass">Real-time booking. Zero waiting.</div>
          </FadeIn>
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

import { ArrowRightIcon, CarGlyph } from './icons.jsx';

function CtaBanner() {
  return (
    <section className="cta-banner reveal">
      <div className="container cta-banner-inner">
        <div>
          <h2>Ready to hit the road?</h2>
          <p>Find your perfect car and start your journey today.</p>
          <a className="btn btn-primary" href="#cars">
            Browse Cars
            <ArrowRightIcon />
          </a>
        </div>
        <div className="cta-banner-art">
          <CarGlyph tint="#f5a623" />
        </div>
      </div>
    </section>
  );
}

export default CtaBanner;

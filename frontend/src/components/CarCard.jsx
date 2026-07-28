import Button from './Button.jsx';
import { CarGlyph } from './icons.jsx';

const TINTS = { amber: '#d88f22', jade: '#2e8b79', dusk: '#3a4368' };

function CarCard({ car, onCheckAvailability }) {
  const tint = TINTS[car.accent] || TINTS.amber;

  return (
    <div className="car-card">
      <div className="car-art" style={{ background: `${tint}14` }}>
        <span className="car-art-tag">
          {car.seats} seats · {car.transmission}
        </span>
        <CarGlyph tint={tint} />
      </div>
      <div className="car-body">
        <h3>{car.name}</h3>
        <div className="car-meta">
          <span>{car.tagline}</span>
        </div>
        <div className="car-foot">
          <div className="price">
            RM{car.pricePerDay}
            <small> /day</small>
          </div>
          <Button className="car-check-btn" onClick={() => onCheckAvailability(car.id)}>
            Check availability
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CarCard;

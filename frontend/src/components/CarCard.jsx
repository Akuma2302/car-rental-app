import Button from './Button.jsx';
import ImageCarousel from './ImageCarousel.jsx';

function CarCard({ car, onCheckAvailability }) {
  return (
    <div className="car-card">
      <ImageCarousel images={car.images} altText={car.name} accent={car.accent} />

      <div className="car-body">
        <div className="car-badges">
          <span className="badge">{car.category}</span>
          <span className="badge">{car.fuelType}</span>
          <span className="badge">{car.transmission}</span>
          <span className="badge">{car.seats} seats</span>
        </div>

        <h3>{car.name}</h3>
        <div className="car-meta">
          <span>{car.tagline}</span>
        </div>

        <div className="car-pricing">
          <div className="price-tier">
            <b>RM{car.pricePerHour}</b>
            <span>/hour</span>
          </div>
          <div className="price-tier">
            <b>RM{car.pricePerHalfDay}</b>
            <span>/half-day</span>
          </div>
          <div className="price-tier price-tier-main">
            <b>RM{car.pricePerDay}</b>
            <span>/day</span>
          </div>
        </div>

        <div className="car-foot">
          <Button className="car-check-btn btn-block" onClick={() => onCheckAvailability(car.id)}>
            Check availability
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CarCard;

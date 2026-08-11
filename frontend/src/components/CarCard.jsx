import Button from './Button.jsx';
import ImageCarousel from './ImageCarousel.jsx';
import { SeatIcon, GearIcon, FuelIcon } from './icons.jsx';

function CarCard({ car, onCheckAvailability }) {
  return (
    <div className="car-row">
      <div className="car-row-media">
        <ImageCarousel images={car.images} altText={car.name} accent={car.accent} />
      </div>

      <div className="car-row-body">
        <h3>{car.name}</h3>
        <p className="car-row-tagline">{car.tagline}</p>
        <div className="car-row-specs">
          <span>
            <SeatIcon /> {car.seats} Seats
          </span>
          <span>
            <GearIcon /> {car.transmission}
          </span>
          <span>
            <FuelIcon /> {car.fuelType}
          </span>
        </div>
      </div>

      <div className="car-row-price">
        <div className="car-row-price-main">
          <b>RM{car.pricePerDay}</b>
          <span>/day</span>
        </div>
        <div className="car-row-price-sub">
          RM{car.pricePerHalfDay} half-day · RM{car.pricePerHour}/hr
        </div>
        <Button className="car-check-btn" onClick={() => onCheckAvailability(car.id)}>
          Check availability
        </Button>
      </div>
    </div>
  );
}

export default CarCard;

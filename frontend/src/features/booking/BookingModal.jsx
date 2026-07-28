import { useEffect, useState } from 'react';
import { useBookingContext } from '../../context/BookingContext.jsx';
import { useAvailability } from '../../hooks/useAvailability.js';
import { createBooking } from '../../services/bookingService.js';
import { todayStr, maxDateStr, formatNiceDate } from '../../utils/date.js';
import { filterVisibleSlots } from '../../utils/slots.js';
import Button from '../../components/Button.jsx';
import { CloseIcon, CheckIcon } from '../../components/icons.jsx';
import TimeSlotGrid from './TimeSlotGrid.jsx';

function BookingModal({ cars }) {
  const { activeCarId, isOpen, closeBooking } = useBookingContext();
  const car = cars.find((c) => c.id === activeCarId) || null;

  const [date, setDate] = useState(todayStr());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const { data: availability, loading, reload } = useAvailability(isOpen ? activeCarId : null, date);

  // Reset the form fresh every time a (new) car is opened.
  useEffect(() => {
    if (isOpen) {
      // Same standard pattern noted in hooks/useCars.js.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDate(todayStr());
      setSelectedSlot(null);
      setName('');
      setPhone('');
      setStatus('idle');
      setErrorMessage('');
    }
  }, [activeCarId, isOpen]);

  // Escape-to-close + lock background scroll while open.
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKey(e) {
      if (e.key === 'Escape') closeBooking();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeBooking]);

  if (!isOpen || !car) return null;

  const visibleSlots = filterVisibleSlots(availability?.slots, date);

  function handleDateChange(e) {
    setDate(e.target.value);
    setSelectedSlot(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedSlot || !name.trim() || !phone.trim()) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const result = await createBooking({
        carId: car.id,
        date,
        time: selectedSlot,
        customerName: name.trim(),
        customerPhone: phone.trim(),
      });
      window.open(result.whatsappUrl, '_blank');
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
      if (err.status === 409) {
        // Someone else grabbed the slot first — drop the stale selection
        // and pull fresh availability so the grid reflects reality.
        setSelectedSlot(null);
        reload();
      }
    }
  }

  function handleBookAgain() {
    setStatus('idle');
    setSelectedSlot(null);
    setName('');
    setPhone('');
    setDate(todayStr());
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) closeBooking();
  }

  return (
    <div className="modal-overlay open" onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modalCarName">
        <div className="modal-head">
          <div>
            <h3 id="modalCarName">{car.name}</h3>
            <span>
              {car.seats} seats · {car.transmission} · RM{car.pricePerDay}/day
            </span>
          </div>
          <button className="modal-close" aria-label="Close" onClick={closeBooking}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          {status !== 'success' ? (
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="dateInput">Pickup date</label>
                <input
                  id="dateInput"
                  type="date"
                  min={todayStr()}
                  max={maxDateStr()}
                  value={date}
                  onChange={handleDateChange}
                  required
                />
              </div>

              <div className="field">
                <label>Available times</label>
                {loading ? (
                  <p className="no-slots">Checking availability…</p>
                ) : (
                  <TimeSlotGrid slots={visibleSlots} selected={selectedSlot} onSelect={setSelectedSlot} />
                )}
                <div className="slot-legend">
                  <span>
                    <i className="dot ok" /> available
                  </span>
                  <span>
                    <i className="dot no" /> already booked
                  </span>
                </div>
              </div>

              {selectedSlot && (
                <div className="selection-recap show">
                  {car.name} · {formatNiceDate(date)} · {selectedSlot}
                </div>
              )}

              <div className="field">
                <label htmlFor="nameInput">Your name</label>
                <input
                  id="nameInput"
                  type="text"
                  placeholder="e.g. Aiman Hakim"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="phoneInput">Your phone number</label>
                <input
                  id="phoneInput"
                  type="tel"
                  placeholder="e.g. 012-345 6789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {status === 'error' && <p className="form-error">{errorMessage}</p>}

              <Button type="submit" block disabled={!selectedSlot || status === 'submitting'}>
                {status === 'submitting' ? 'Confirming…' : 'Confirm via WhatsApp'}
              </Button>
              <p className="whatsapp-note">
                You&rsquo;ll be taken to WhatsApp with your booking pre-filled — just hit send to confirm with
                our team.
              </p>
            </form>
          ) : (
            <div className="success-state show">
              <div className="check">
                <CheckIcon />
              </div>
              <h4>Almost there!</h4>
              <p>We opened WhatsApp with your booking details filled in. Send the message and our team will confirm your car shortly.</p>
              <Button variant="outline" block onClick={handleBookAgain}>
                Make another booking
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingModal;

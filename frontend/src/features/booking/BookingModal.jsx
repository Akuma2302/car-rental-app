import { useEffect, useState } from 'react';
import { useBookingContext } from '../../context/BookingContext.jsx';
import { useBookedRanges } from '../../hooks/useBookedRanges.js';
import { usePriceQuote } from '../../hooks/usePriceQuote.js';
import { createBooking } from '../../services/bookingService.js';
import { todayStr, maxDateStr, combineDateTime, formatRangeShort, defaultReturn } from '../../utils/date.js';
import { findConflict } from '../../utils/rangeOverlap.js';
import { siteConfig } from '../../utils/siteConfig.js';
import Button from '../../components/Button.jsx';
import { CloseIcon, CheckIcon } from '../../components/icons.jsx';
import DateTimeField from './DateTimeField.jsx';
import ReceiptUpload from './ReceiptUpload.jsx';

function defaultPickupTime() {
  const nextHour = Math.min(Math.max(new Date().getHours() + 1, siteConfig.openHour), siteConfig.closeHour);
  return `${String(nextHour).padStart(2, '0')}:00`;
}

// idle -> submitting -> awaiting-payment -> confirmed
//                     \-> error (booking creation failed)
function BookingModal({ cars }) {
  const { activeCarId, isOpen, closeBooking } = useBookingContext();
  const car = cars.find((c) => c.id === activeCarId) || null;

  const [pickupDate, setPickupDate] = useState(todayStr());
  const [pickupTime, setPickupTime] = useState(defaultPickupTime());
  const [returnDate, setReturnDate] = useState(todayStr());
  const [returnTime, setReturnTime] = useState(defaultPickupTime());
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);

  const { ranges: bookedRanges, reload: reloadRanges } = useBookedRanges(
    isOpen ? activeCarId : null,
    todayStr(),
    maxDateStr(180)
  );

  const startAt = combineDateTime(pickupDate, pickupTime);
  const endAt = combineDateTime(returnDate, returnTime);
  const { quote, loading: quoteLoading } = usePriceQuote(activeCarId, startAt, endAt);
  const conflict = findConflict(startAt, endAt, bookedRanges);
  const validRange = startAt && endAt && new Date(endAt) > new Date(startAt);

  // Reset the form fresh every time a (new) car is opened.
  useEffect(() => {
    if (isOpen) {
      const pDate = todayStr();
      const pTime = defaultPickupTime();
      // Standard fetch/reset-on-mount pattern (react.dev/learn/synchronizing-with-effects).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPickupDate(pDate);
      setPickupTime(pTime);
      const ret = defaultReturn(pDate, pTime);
      setReturnDate(ret.date);
      setReturnTime(ret.time);
      setName('');
      setPhone('');
      setStatus('idle');
      setErrorMessage('');
      setCreatedBookingId(null);
      setShowReceiptUpload(false);
    }
  }, [activeCarId, isOpen]);

  // Keep the return date roughly a day ahead when the pickup date changes,
  // so the fields don't silently produce an invalid (end before start) range.
  useEffect(() => {
    if (!isOpen) return;
    if (returnDate < pickupDate) {
      const ret = defaultReturn(pickupDate, pickupTime);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReturnDate(ret.date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupDate]);

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

  const canSubmit = validRange && !conflict && name.trim() && phone.trim() && status !== 'submitting';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const result = await createBooking({
        carId: car.id,
        startAt,
        endAt,
        customerName: name.trim(),
        customerPhone: phone.trim(),
      });
      window.open(result.whatsappUrl, '_blank');
      setCreatedBookingId(result.booking.id);
      setStatus('awaiting-payment');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
      if (err.status === 409) {
        reloadRanges();
      }
    }
  }

  function handlePaymentConfirmed() {
    setStatus('confirmed');
    setShowReceiptUpload(false);
  }

  function handleBookAgain() {
    setStatus('idle');
    setName('');
    setPhone('');
    setCreatedBookingId(null);
    setShowReceiptUpload(false);
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
          {status === 'idle' || status === 'submitting' || status === 'error' ? (
            <form className="booking-form" onSubmit={handleSubmit}>
              <DateTimeField
                label="Pick-up"
                idPrefix="pickup"
                dateValue={pickupDate}
                timeValue={pickupTime}
                onDateChange={setPickupDate}
                onTimeChange={setPickupTime}
                min={todayStr()}
                max={maxDateStr()}
              />
              <DateTimeField
                label="Return"
                idPrefix="return"
                dateValue={returnDate}
                timeValue={returnTime}
                onDateChange={setReturnDate}
                onTimeChange={setReturnTime}
                min={pickupDate}
                max={maxDateStr()}
              />

              {!validRange && <p className="form-error">Return must be after pick-up.</p>}

              {validRange && conflict && (
                <p className="form-error">
                  That range overlaps an existing booking ({formatRangeShort(conflict.startAt)} –{' '}
                  {formatRangeShort(conflict.endAt)}). Pick a different date or time.
                </p>
              )}

              {validRange && !conflict && (
                <div className="selection-recap show">
                  {quoteLoading && 'Calculating price…'}
                  {!quoteLoading && quote && (
                    <>
                      {quote.duration} · <b>RM{quote.totalPrice}</b> total
                    </>
                  )}
                </div>
              )}

              {bookedRanges.length > 0 && (
                <details className="booked-ranges-details">
                  <summary>
                    {bookedRanges.length} existing booking{bookedRanges.length === 1 ? '' : 's'} on this car
                  </summary>
                  <ul className="booked-ranges-list">
                    {bookedRanges.map((r, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <li key={i}>
                        {formatRangeShort(r.startAt)} – {formatRangeShort(r.endAt)}
                      </li>
                    ))}
                  </ul>
                </details>
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

              <Button type="submit" block disabled={!canSubmit}>
                {status === 'submitting' ? 'Confirming…' : 'Confirm via WhatsApp'}
              </Button>
              <p className="whatsapp-note">
                You&rsquo;ll be taken to WhatsApp with your booking pre-filled. Your booking stays{' '}
                <b>pending</b> until you confirm payment below.
              </p>
            </form>
          ) : status === 'awaiting-payment' ? (
            <div className="success-state show">
              <div className="check check-pending">
                <CheckIcon />
              </div>
              <h4>Booking request sent — status: pending</h4>
              <p>
                We opened WhatsApp with your booking details. Arrange payment with our team there, then come
                back and confirm below by uploading your payment receipt.
              </p>

              {!showReceiptUpload ? (
                <>
                  <Button block onClick={() => setShowReceiptUpload(true)}>
                    Confirm payment
                  </Button>
                  <Button variant="outline" block onClick={handleBookAgain}>
                    Make another booking
                  </Button>
                </>
              ) : (
                <ReceiptUpload
                  bookingId={createdBookingId}
                  onConfirmed={handlePaymentConfirmed}
                  onCancel={() => setShowReceiptUpload(false)}
                />
              )}
            </div>
          ) : (
            <div className="success-state show">
              <div className="check">
                <CheckIcon />
              </div>
              <h4>Booking confirmed!</h4>
              <p>Your payment receipt has been received and your booking is now confirmed. See you soon!</p>
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

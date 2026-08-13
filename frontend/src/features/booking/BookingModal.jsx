import { useEffect, useState } from 'react';
import { useBookingContext } from '../../context/BookingContext.jsx';
import { useBookedRanges } from '../../hooks/useBookedRanges.js';
import { usePriceQuote } from '../../hooks/usePriceQuote.js';
import { createBooking, fetchBookingStatus, cancelOwnBooking } from '../../services/bookingService.js';
import { todayStr, maxDateStr, combineDateTime, formatRangeShort, defaultReturn } from '../../utils/date.js';
import { findConflict } from '../../utils/rangeOverlap.js';
import { savePendingBooking, clearPendingBooking } from '../../utils/pendingBooking.js';
import { siteConfig } from '../../utils/siteConfig.js';
import Button from '../../components/Button.jsx';
import { CloseIcon, CheckIcon } from '../../components/icons.jsx';
import DateTimeField from './DateTimeField.jsx';

const MALAYSIA_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Pulau Pinang',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'W.P. Kuala Lumpur',
  'W.P. Labuan',
  'W.P. Putrajaya',
];

function defaultPickupTime() {
  const nextHour = Math.min(Math.max(new Date().getHours() + 1, siteConfig.openHour), siteConfig.closeHour);
  return `${String(nextHour).padStart(2, '0')}:00`;
}

// idle -> submitting -> awaiting-payment -> confirmed
//                     \-> cancelling -> cancelled
//                     \-> error (booking creation failed)
// loading-resume -> awaiting-payment | confirmed | cancelled  (reopening an existing booking)
function BookingModal({ cars }) {
  const { activeCarId, resumeBookingId, isOpen, closeBooking } = useBookingContext();
  const car = cars.find((c) => c.id === activeCarId) || null;

  const [pickupDate, setPickupDate] = useState(todayStr());
  const [pickupTime, setPickupTime] = useState(defaultPickupTime());
  const [returnDate, setReturnDate] = useState(todayStr());
  const [returnTime, setReturnTime] = useState(defaultPickupTime());
  const [step, setStep] = useState('dates'); // 'dates' -> 'details' -> (status takes over)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ic, setIc] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

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

  // Fresh booking vs. resuming an existing pending one — reset (or load)
  // fresh every time the modal opens for a (possibly new) car.
  useEffect(() => {
    if (!isOpen) return undefined;

    if (resumeBookingId) {
      let cancelled = false;
      // Standard fetch-on-mount pattern (react.dev/learn/synchronizing-with-effects).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('loading-resume');
      setErrorMessage('');
      setCreatedBookingId(resumeBookingId);

      fetchBookingStatus(resumeBookingId)
        .then((booking) => {
          if (cancelled) return;
          if (booking.status === 'booked') setStatus('confirmed');
          else if (booking.status === 'cancelled') setStatus('cancelled');
          else setStatus('awaiting-payment');
        })
        .catch((err) => {
          if (cancelled) return;
          setStatus('error');
          setErrorMessage(err.message || "Couldn't load that booking. Please try again.");
        });

      return () => {
        cancelled = true;
      };
    }

    const pDate = todayStr();
    const pTime = defaultPickupTime();
    // Standard fetch/reset-on-mount pattern (react.dev/learn/synchronizing-with-effects).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPickupDate(pDate);
    setPickupTime(pTime);
    const ret = defaultReturn(pDate, pTime);
    setReturnDate(ret.date);
    setReturnTime(ret.time);
    setStep('dates');
    setName('');
    setPhone('');
    setIc('');
    setAddress('');
    setPostcode('');
    setCity('');
    setState('');
    setStatus('idle');
    setErrorMessage('');
    setCreatedBookingId(null);
    return undefined;
  }, [activeCarId, resumeBookingId, isOpen]);

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

  const canProceedToDetails = validRange && !conflict;
  const canSubmit =
    canProceedToDetails &&
    name.trim() &&
    phone.trim() &&
    ic.trim() &&
    address.trim() &&
    postcode.trim() &&
    city.trim() &&
    state.trim() &&
    status !== 'submitting';

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
        customerIc: ic.trim(),
        customerAddress: address.trim(),
        customerPostcode: postcode.trim(),
        customerCity: city.trim(),
        customerState: state,
      });
      window.open(result.whatsappUrl, '_blank');
      setCreatedBookingId(result.booking.id);
      savePendingBooking(result.booking.id, car.id);
      setStatus('awaiting-payment');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
      if (err.status === 409) {
        reloadRanges();
      }
    }
  }

  async function handleCancelBooking() {
    if (!createdBookingId) return;
    if (!window.confirm("Cancel this booking? You'll need to start over if you change your mind.")) return;

    setCancelling(true);
    setErrorMessage('');
    try {
      await cancelOwnBooking(createdBookingId);
      clearPendingBooking();
      setStatus('cancelled');
    } catch (err) {
      setErrorMessage(err.message || 'Could not cancel this booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  }

  function handleBookAgain() {
    setStatus('idle');
    setStep('dates');
    setName('');
    setPhone('');
    setIc('');
    setAddress('');
    setPostcode('');
    setCity('');
    setState('');
    setCreatedBookingId(null);
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
          {status === 'loading-resume' ? (
            <p className="state-message">Loading your booking…</p>
          ) : status === 'idle' || status === 'submitting' || status === 'error' ? (
            <form className="booking-form" onSubmit={handleSubmit}>
              {step === 'dates' ? (
                <>
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

                  <Button
                    type="button"
                    block
                    disabled={!canProceedToDetails}
                    onClick={() => setStep('details')}
                  >
                    Next
                  </Button>
                </>
              ) : (
                <>
                  <button type="button" className="form-back-link" onClick={() => setStep('dates')}>
                    ‹ Back to dates
                  </button>

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
                  <div className="field">
                    <label htmlFor="icInput">IC number</label>
                    <input
                      id="icInput"
                      type="text"
                      placeholder="e.g. 900101-14-5566"
                      value={ic}
                      onChange={(e) => setIc(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="addressInput">Address (house number &amp; lane)</label>
                    <input
                      id="addressInput"
                      type="text"
                      placeholder="e.g. No. 12, Jalan Bunga Raya"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="postcodeInput">Postcode</label>
                      <input
                        id="postcodeInput"
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 50000"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="cityInput">City</label>
                      <input
                        id="cityInput"
                        type="text"
                        placeholder="e.g. Kuala Lumpur"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="stateInput">State</label>
                    <select id="stateInput" value={state} onChange={(e) => setState(e.target.value)} required>
                      <option value="" disabled>
                        Select a state
                      </option>
                      {MALAYSIA_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {status === 'error' && <p className="form-error">{errorMessage}</p>}

                  <Button type="submit" block disabled={!canSubmit}>
                    {status === 'submitting' ? 'Confirming…' : 'Confirm booking'}
                  </Button>
                  <p className="whatsapp-note">
                    You&rsquo;ll be taken to WhatsApp with your booking pre-filled. Your booking stays{' '}
                    <b>pending</b> until you confirm payment below.
                  </p>
                </>
              )}
            </form>
          ) : status === 'awaiting-payment' ? (
            <div className="success-state show">
              <div className="check check-pending">
                <CheckIcon />
              </div>
              <h4>Booking request sent — status: pending</h4>
              <p>
                We opened WhatsApp with your booking details. Send your payment receipt to us there — our team
                will confirm it on our end, no need to upload anything here. Changed your mind? You can cancel
                this booking instead.
              </p>

              {errorMessage && <p className="form-error">{errorMessage}</p>}

              <Button block onClick={closeBooking}>
                Got it
              </Button>
              <Button variant="outline" block onClick={handleCancelBooking} disabled={cancelling}>
                {cancelling ? 'Cancelling…' : 'Cancel this booking'}
              </Button>
            </div>
          ) : status === 'cancelled' ? (
            <div className="success-state show">
              <div className="check check-cancelled">
                <CloseIcon />
              </div>
              <h4>Booking cancelled</h4>
              <p>This booking has been cancelled and the date is available again.</p>
              <Button block onClick={handleBookAgain}>
                Make a new booking
              </Button>
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

import { createContext, useContext, useMemo, useState } from 'react';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [activeCarId, setActiveCarId] = useState(null);
  // Set only when reopening an existing pending booking (resume flow) —
  // null means "start a fresh booking for this car" instead.
  const [resumeBookingId, setResumeBookingId] = useState(null);

  const value = useMemo(
    () => ({
      activeCarId,
      resumeBookingId,
      isOpen: activeCarId !== null,
      openBooking: (carId) => {
        setResumeBookingId(null);
        setActiveCarId(carId);
      },
      resumeBooking: (carId, bookingId) => {
        setResumeBookingId(bookingId);
        setActiveCarId(carId);
      },
      closeBooking: () => {
        setActiveCarId(null);
        setResumeBookingId(null);
      },
    }),
    [activeCarId, resumeBookingId]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookingContext() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return ctx;
}

import { createContext, useContext, useMemo, useState } from 'react';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [activeCarId, setActiveCarId] = useState(null);

  const value = useMemo(
    () => ({
      activeCarId,
      isOpen: activeCarId !== null,
      openBooking: (carId) => setActiveCarId(carId),
      closeBooking: () => setActiveCarId(null),
    }),
    [activeCarId]
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

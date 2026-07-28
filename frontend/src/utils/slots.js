import { todayStr } from './date.js';

/**
 * The backend returns every slot for the operating day regardless of the
 * time right now — "is this hour in the past" is a viewer's-local-clock
 * question, so it's handled here on the frontend rather than the server.
 */
export function filterVisibleSlots(slots, date) {
  if (!slots) return [];
  if (date !== todayStr()) return slots;

  const currentHour = new Date().getHours();
  return slots.filter((slot) => parseInt(slot.time, 10) > currentHour);
}

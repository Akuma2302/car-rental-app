export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function maxDateStr(daysAhead = 90) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

export function formatNiceDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Inline SVG icons as components (rather than image assets) so things like
// CarGlyph can take a dynamic per-car tint color as a prop.

export function CarGlyph({ tint = '#d88f22' }) {
  return (
    <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 70 L32 40 Q40 28 58 28 L130 28 Q146 28 154 40 L168 70 Z"
        fill={tint}
        opacity="0.18"
      />
      <path
        d="M20 70 L32 40 Q40 28 58 28 L130 28 Q146 28 154 40 L168 70"
        fill="none"
        stroke={tint}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <line x1="14" y1="70" x2="174" y2="70" stroke={tint} strokeWidth="4" strokeLinecap="round" />
      <circle cx="56" cy="74" r="13" fill="var(--card)" stroke={tint} strokeWidth="4" />
      <circle cx="132" cy="74" r="13" fill="var(--card)" stroke={tint} strokeWidth="4" />
      <line x1="70" y1="29" x2="78" y2="46" stroke={tint} strokeWidth="3" />
    </svg>
  );
}

export function SeatIcon(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 4v9a2 2 0 0 0 2 2h4M6 13H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1M18 20v-5a2 2 0 0 0-2-2h-4M20 20h-2v-3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1Z" />
    </svg>
  );
}

export function GearIcon(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5" />
    </svg>
  );
}

export function FuelIcon(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 22V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 10h9M16 8l3 2v6a1.5 1.5 0 0 0 3 0V9a2 2 0 0 0-.6-1.4L18.5 5" />
    </svg>
  );
}

export function ClockIcon(props) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function CalendarIcon(props) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 3v4M19 3v4M3 11h18M5 7h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function SnackIcon(props) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 11h18M3 11a8 8 0 0 0 16 0M3 11l1-5h16l1 5M9 16v1M15 16v1" />
    </svg>
  );
}

export function PinIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function PhoneIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function CheckIcon(props) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function FacebookIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z" />
    </svg>
  );
}

export function InstagramIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" />
    </svg>
  );
}

export function TiktokIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M9 12a4 4 0 1 0 4 4V4c.8 2 2.6 3.4 5 3.6" />
    </svg>
  );
}

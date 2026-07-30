// Single source of truth for the business details shown across the site.
// Update these and the header, hero, footer, and location section all follow.
//
// Note: the WhatsApp number that actually builds the booking message lives
// in backend/.env (WHATSAPP_NUMBER) — keep the value below in sync with it,
// it's used here only for display (nav bar, footer, "Call us" button).
export const siteConfig = {
  businessName: 'JalanGo',
  phoneDisplay: '017-250 7341',
  phoneHref: 'tel:+60172507341',
  whatsappNumber: '60172507341',
  hours: 'Daily, 7:00am – 10:00pm',
  // Numeric form of the same hours, used to build the pickup/return time
  // selects in the booking modal. Keep in sync with the string above and
  // with OPEN_HOUR/CLOSE_HOUR in backend/.env.
  openHour: 7,
  closeHour: 22,
  address: {
    line1: '[Your Street Address]',
    line2: '[Postcode] [City]',
    line3: '[State], Malaysia',
  },
  social: {
    facebook: '#',
    instagram: '#',
    tiktok: '#',
  },
  // Get your own: Google Maps → search your address → Share → Embed a map → copy the src URL.
  mapEmbedSrc: 'https://www.google.com/maps?q=Kuala+Lumpur,Malaysia&output=embed',
};

import SectionHeading from './SectionHeading.jsx';
import { TagIcon, CalendarIcon, ShieldCheckIcon, PinIcon, ClockIcon } from './icons.jsx';

const REASONS = [
  {
    key: 'pricing',
    Icon: TagIcon,
    title: 'Transparent Pricing',
    body: 'Hourly, half-day, and daily rates shown upfront — no hidden fees.',
  },
  {
    key: 'booking',
    Icon: CalendarIcon,
    title: 'Easy Online Booking',
    body: 'Pick your dates, fill in your details, confirm on WhatsApp — done in minutes.',
  },
  {
    key: 'fleet',
    Icon: ShieldCheckIcon,
    title: 'Well-Maintained Fleet',
    body: 'Cars are tracked and taken off the road for servicing whenever needed.',
  },
  {
    key: 'pickup',
    Icon: PinIcon,
    title: 'Convenient Pickup',
    body: 'One easy pickup point, clearly marked so you\u2019re never guessing where to go.',
  },
  {
    key: 'realtime',
    Icon: ClockIcon,
    title: 'Real-Time Booking',
    body: 'Book anytime, day or night \u2014 availability updates the moment a slot is taken.',
  },
];

function WhyChooseSection() {
  return (
    <section className="why-choose reveal">
      <div className="container">
        <SectionHeading title="Why Choose JAGO?" center />
        <div className="why-choose-grid">
          {REASONS.map(({ key, Icon, title, body }) => (
            <div className="why-choose-card" key={key}>
              <div className="why-choose-icon">
                <Icon />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseSection;

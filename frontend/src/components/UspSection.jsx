import SectionHeading from './SectionHeading.jsx';
import { ClockIcon, CalendarIcon, SnackIcon } from './icons.jsx';

const USPS = [
  {
    key: 'realtime',
    tint: 'amber',
    Icon: ClockIcon,
    title: '24-hour real-time reservation',
    body: 'Availability updates the moment a slot is booked, so what you see on the page is always accurate — book at 3pm or 3am.',
  },
  {
    key: 'hours',
    tint: 'jade',
    Icon: CalendarIcon,
    title: 'Open 7am – 10pm',
    body: 'Early flight or a late return? Our counter is open daily from 7 in the morning until 10 at night.',
  },
  {
    key: 'snacks',
    tint: 'coral',
    Icon: SnackIcon,
    title: 'Snacks come standard',
    body: 'Every car leaves the lot with a little something to munch on for the road — on the house.',
  },
];

function UspSection() {
  return (
    <section className="usp reveal" id="why-us">
      <div className="container">
        <SectionHeading eyebrow="Why book with us" title="Built around how you actually rent a car" />
        <div className="usp-grid">
          {USPS.map(({ key, tint, Icon, title, body }) => (
            <div className="usp-card" key={key}>
              <div className={`usp-icon usp-icon-${tint}`}>
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

export default UspSection;

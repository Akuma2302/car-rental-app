import SectionHeading from './SectionHeading.jsx';
import { SearchStepIcon, CarStepIcon, MessageIcon, KeyIcon } from './icons.jsx';

const STEPS = [
  {
    key: 'browse',
    number: '01',
    Icon: SearchStepIcon,
    title: 'Browse',
    body: 'Filter by type, price, transmission and more to find the right car.',
  },
  {
    key: 'dates',
    number: '02',
    Icon: CarStepIcon,
    title: 'Pick Your Dates',
    body: 'Choose your pick-up and return date & time for the car you want.',
  },
  {
    key: 'confirm',
    number: '03',
    Icon: MessageIcon,
    title: 'Confirm via WhatsApp',
    body: 'Fill in your details and confirm \u2014 we\u2019ll be in touch on WhatsApp.',
  },
  {
    key: 'drive',
    number: '04',
    Icon: KeyIcon,
    title: 'Pick Up & Drive',
    body: 'Once payment\u2019s confirmed, pick up your car and hit the road.',
  },
];

function HowItWorksSection() {
  return (
    <section className="how-it-works reveal">
      <div className="container">
        <SectionHeading title="How It Works" center />
        <div className="how-it-works-row">
          {STEPS.map(({ key, number, Icon, title, body }, i) => (
            <div className="how-it-works-item-wrap" key={key}>
              <div className="how-it-works-item">
                <div className="how-it-works-top">
                  <span className="how-it-works-number">{number}</span>
                  <Icon />
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
              {i < STEPS.length - 1 && <span className="how-it-works-arrow">›</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;

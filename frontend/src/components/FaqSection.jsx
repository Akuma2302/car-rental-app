import SectionHeading from './SectionHeading.jsx';
import { ChevronDownIcon } from './icons.jsx';

const FAQS = [
  {
    key: 'documents',
    q: 'What documents do I need to rent a car?',
    a: 'A valid driving license and identification (IC or passport) are required at pick-up. Bring the physical documents with you.',
  },
  {
    key: 'return-location',
    q: 'Can I return the car at a different location?',
    a: 'All rentals are picked up and returned to our one location \u2014 see the Location section below for the address.',
  },
  {
    key: 'extend',
    q: 'Can I extend my rental period?',
    a: 'Message us on WhatsApp before your return time and we\u2019ll do our best to extend it, subject to the car\u2019s availability for the following days.',
  },
  {
    key: 'late-return',
    q: 'What happens if I return the car late?',
    a: 'Let us know as early as possible if you\u2019re running late \u2014 additional charges may apply for a late return.',
  },
  {
    key: 'insurance',
    q: 'Is insurance included in the rental?',
    a: 'Message us on WhatsApp before booking and we\u2019ll walk you through what\u2019s covered for your rental.',
  },
  {
    key: 'cancellation',
    q: 'What is your cancellation policy?',
    a: 'You can cancel for free anytime while your booking is still pending, right from the confirmation screen. Once a booking is confirmed, contact us directly to cancel.',
  },
];

function FaqSection() {
  return (
    <section className="faq reveal">
      <div className="container">
        <div className="faq-head">
          <SectionHeading eyebrow="Got questions?" title="Frequently Asked Questions" />
        </div>
        <div className="faq-grid">
          {FAQS.map(({ key, q, a }) => (
            <details className="faq-item" key={key}>
              <summary>
                {q}
                <ChevronDownIcon className="faq-chevron" />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;

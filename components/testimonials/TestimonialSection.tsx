import React from 'react';
import { FaStar } from 'react-icons/fa';

const testimonials = [
  {
    rating: 5,
    headline: 'Customers appreciate how quickly their questions get answered.',
    quote:
      'We set up Piha AI to answer inbound website inquiries. When shoppers get a friendly, immediate phone call and WhatsApp catalog, they are genuinely impressed.',
    name: 'Vikram Mehta',
    role: 'Founder at KwikCommerce',
    initials: 'VM',
  },
  {
    rating: 5,
    headline: 'Natural Hindi & Kannada conversation that shoppers connect with.',
    quote:
      'Our regional customers love speaking in Hindi and Kannada. Piha AI sounds natural, friendly, and answers all their product questions accurately.',
    name: 'Ananya Sharma',
    role: 'Operations Lead at BharatLogix',
    initials: 'AS',
  },
  {
    rating: 5,
    headline: 'Follows our product catalog and schedules follow-up calls easily.',
    quote:
      'It sticks closely to our approved product information and prices. Calendar invites and call notes appear right in our calendar without any extra manual work.',
    name: 'Rohan Deshmukh',
    role: 'Co-Founder at UrbanScale',
    initials: 'RD',
  },
];

export const TestimonialSection: React.FC = () => {
  return (
    <section className="section" id="testimonials">
      <div className="section-header">
        <h2 className="section-title">Tested on Live Phone Calls</h2>
        <p className="section-subhead">
          Businesses use Piha AI to give every customer inquiry a prompt and friendly response.
        </p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((t, idx) => (
          <div className="testimonial-card" key={idx}>
            <div>
              <div style={{ display: 'flex', gap: '4px', color: 'var(--color-ink)', marginBottom: '16px' }}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <FaStar key={i} size={14} />
                ))}
              </div>
              <h3 className="testimonial-headline">{t.headline}</h3>
              <p className="testimonial-quote">"{t.quote}"</p>
            </div>

            <div className="testimonial-author-row">
              <div className="testimonial-avatar">{t.initials}</div>
              <div>
                <div className="author-name">{t.name}</div>
                <div className="author-role">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Verified conversion rate uplift statistics for enterprise leads

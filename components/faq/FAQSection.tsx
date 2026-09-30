'use client';

import React, { useState } from 'react';
import { FiPlus, FiMinus, FiHelpCircle, FiPhoneCall, FiArrowRight } from 'react-icons/fi';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How fast does the assistant reply during a call?',
    answer:
      'It replies right away—just like talking to a real person. There are no awkward delays or long pauses, so conversations feel natural and smooth.',
  },
  {
    question: 'Can customers interrupt whenever they want?',
    answer:
      'Yes, absolutely. If a customer speaks up or asks a question while the assistant is talking, it stops talking immediately and listens to what they need.',
  },
  {
    question: 'How does sending WhatsApp messages during calls work?',
    answer:
      'Whenever a customer asks for pricing, product catalogs, or brochures, the assistant sends them straight to their WhatsApp number while they are still on the phone.',
  },
  {
    question: 'What if a customer asks for a discount you do not offer?',
    answer:
      'The assistant only shares the exact prices, deals, and policies you approve in advance. It politely explains your standard pricing and never makes up unauthorized discounts.',
  },
  {
    question: 'Can I test calling my own phone right now?',
    answer:
      'Yes! Click the "Try a Free Sample Call" button on this card, enter your mobile number, and our assistant will place a quick demonstration call to your phone.',
  },
];

const faqTextures = [
  '/assets/back-img/card-img/mist.webp',
  '/assets/back-img/card-img/sand.webp',
  '/assets/back-img/card-img/sage.webp',
  '/assets/back-img/card-img/ochre.webp',
  '/assets/back-img/card-img/plum.webp',
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    // Keep the clicked question open so size is fixed and does not shrink on click
    setOpenIndex(idx);
  };

  const handleOpenDialer = () => {
    window.dispatchEvent(new CustomEvent('elevatevoice:open-dialer'));
  };

  return (
    <section className="section bento-section" id="faq">
      <div className="section-header bento-header">
        <span
          className="bento-badge"
          style={{
            backgroundColor: 'var(--color-monkey-sand)',
            color: 'var(--color-monkey-charcoal)',
          }}
        >
          <FiHelpCircle size={13} /> Common Questions
        </span>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subhead">
          Simple answers to common questions about how our voice assistant helps your business grow.
        </p>
      </div>

      <div className="bento-grid faq-bento-grid">
        {/* Left Bento Action Card (Span 4) */}
        <div className="bento-card bento-span-4 bento-theme-burgundy faq-action-card">
          <div>
            <span
              className="bento-pill-tag"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
                color: '#ffffff',
                marginBottom: '16px',
              }}
            >
              Live Demo Ready
            </span>
            <h3 className="bento-card-title" style={{ color: '#ffffff', fontSize: '26px' }}>
              Want to hear it on your own phone?
            </h3>
            <p className="bento-card-desc" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>
              Hear how clear and natural it sounds in Hindi, English, Kannada, or Telugu right now.
            </p>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button
              type="button"
              onClick={handleOpenDialer}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '9999px',
                backgroundColor: '#ffffff',
                color: 'var(--color-monkey-terracotta)',
                fontSize: '14px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.15s ease',
              }}
            >
              <FiPhoneCall size={16} />
              <span>Try a Free Sample Call</span>
              <FiArrowRight size={15} />
            </button>
            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.8)' }}>
              Takes 10 seconds · No credit card required
            </div>
          </div>
        </div>

        {/* Right Bento Accordion Stack (Span 8) */}
        <div className="bento-span-8 faq-accordion-stack">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="faq-accordion-item"
                style={{
                  backgroundImage: `url(${faqTextures[idx % faqTextures.length]})`,
                  boxShadow: isOpen ? '0 8px 24px rgba(0, 0, 0, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="faq-accordion-trigger"
                >
                  <span style={{ paddingRight: '16px' }}>{faq.question}</span>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isOpen ? 'var(--color-monkey-terracotta)' : 'rgba(0, 0, 0, 0.08)',
                      color: isOpen ? '#ffffff' : 'var(--color-monkey-charcoal)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isOpen ? <FiMinus size={15} /> : <FiPlus size={15} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="faq-accordion-content">
                    <p style={{ margin: 0 }}>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

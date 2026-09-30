'use client';

import React from 'react';
import { FiPhoneCall, FiMessageSquare, FiSend, FiCheckSquare, FiLayers, FiArrowRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const bentoSteps = [
  {
    step: '01',
    title: 'Customer Inquires',
    desc: 'A customer fills out a form on your website, clicks an ad, or leaves their contact number.',
    icon: <FiMessageSquare size={20} />,
    themeClass: 'bento-theme-mist',
    spanClass: 'bento-span-4',
    badgeBg: 'rgba(255, 255, 255, 0.85)',
    badgeColor: '#171514',
    chip: 'Inquiry Received',
  },
  {
    step: '02',
    title: 'Quick Phone Call',
    desc: 'The assistant places a call and greets the customer warmly in their preferred language.',
    icon: <FiPhoneCall size={20} />,
    themeClass: 'bento-theme-ochre-light',
    spanClass: 'bento-span-4',
    badgeBg: 'rgba(255, 255, 255, 0.85)',
    badgeColor: '#171514',
    chip: 'Connects Promptly',
  },
  {
    step: '03',
    title: 'Helpful Conversation',
    desc: 'Listens to what they need, answers product questions clearly, and helps them choose the right option.',
    icon: <FiLayers size={20} />,
    themeClass: 'bento-theme-terracotta',
    spanClass: 'bento-span-4',
    badgeBg: 'rgba(255, 255, 255, 0.22)',
    badgeColor: '#ffffff',
    chip: 'Natural Pace',
  },
  {
    step: '04',
    title: 'WhatsApp Information Dispatch',
    desc: 'Sends product brochures, store links, or meeting invites directly to WhatsApp while on the phone.',
    icon: <FaWhatsapp size={20} />,
    themeClass: 'bento-theme-sage',
    spanClass: 'bento-span-6',
    badgeBg: 'rgba(255, 255, 255, 0.85)',
    badgeColor: '#171514',
    chip: 'Sent Mid-Call',
  },
  {
    step: '05',
    title: 'Logged for Your Team',
    desc: 'Call notes, customer questions, and next steps are saved and shared with your team.',
    icon: <FiCheckSquare size={20} />,
    themeClass: 'bento-theme-plum',
    spanClass: 'bento-span-6',
    badgeBg: 'rgba(255, 255, 255, 0.22)',
    badgeColor: '#ffffff',
    chip: 'Team Notified',
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="section bento-section" id="how-it-works">
      <span id="architecture" style={{ position: 'absolute', visibility: 'hidden' }} />
      <div className="section-header bento-header">
        <span
          className="bento-badge"
          style={{
            backgroundColor: 'var(--color-monkey-sand)',
            color: 'var(--color-monkey-charcoal)',
          }}
        >
          Simple 5-Step Process
        </span>
        <h2 className="section-title">How It Works in 5 Simple Steps</h2>
        <p className="section-subhead">
          From the first customer inquiry to a satisfied shopper neatly saved in your records.
        </p>
      </div>

      <div className="bento-grid">
        {bentoSteps.map((s, idx) => {
          const isDark = s.themeClass === 'bento-theme-terracotta' || s.themeClass === 'bento-theme-plum';

          return (
            <div className={`bento-card ${s.spanClass} ${s.themeClass}`} key={idx}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <span
                    className="bento-pill-tag"
                    style={{
                      backgroundColor: s.badgeBg,
                      color: s.badgeColor,
                    }}
                  >
                    STEP {s.step}
                  </span>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.75)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDark ? '#ffffff' : '#171514',
                    }}
                  >
                    {s.icon}
                  </div>
                </div>

                <h3 className="bento-card-title" style={{ color: isDark ? '#ffffff' : '#171514' }}>
                  {s.title}
                </h3>
                <p
                  className="bento-card-desc"
                  style={{
                    color: isDark ? 'rgba(255, 255, 255, 0.92)' : '#2c2927',
                    marginBottom: '20px',
                  }}
                >
                  {s.desc}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.82)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: isDark ? '#ffffff' : '#171514',
                }}
              >
                <span>{s.chip}</span>
                <FiArrowRight size={14} style={{ opacity: 0.7 }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

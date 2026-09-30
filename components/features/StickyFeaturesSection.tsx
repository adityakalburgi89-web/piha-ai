'use client';

import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiFileText, FiCalendar, FiCheck, FiShield, FiGlobe, FiZap } from 'react-icons/fi';

export const StickyFeaturesSection: React.FC = () => {
  return (
    <section className="section bento-section" id="features">
      <div className="section-header bento-header">
        <span
          className="bento-badge"
          style={{
            backgroundColor: 'var(--color-monkey-ochre-badge)',
            color: 'var(--color-monkey-ochre-dark)',
          }}
        >
          <FiZap size={13} /> What Piha AI Does
        </span>
        <h2 className="section-title">Built to Feel Natural &amp; Reliable</h2>
        <p className="section-subhead">
          Designed to connect with customers quickly, answer questions clearly, and share details on WhatsApp.
        </p>
      </div>

      <div className="bento-grid">
        {/* Bento Card 1: Large Span 8 (Sand / Terracotta Accent) */}
        <div className="bento-card bento-span-8 bento-theme-sand">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span
                className="bento-pill-tag"
                style={{
                  backgroundColor: 'var(--color-monkey-terracotta-badge)',
                  color: 'var(--color-monkey-terracotta-dark)',
                }}
              >
                Natural Speaking
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-monkey-terracotta)' }}>
                01 / 05
              </span>
            </div>
            <h3 className="bento-card-title">Natural Conversations That Can Be Interrupted</h3>
            <p className="bento-card-desc">
              Speaks with a natural tone and friendly pace. When a customer speaks up or asks a question mid-sentence, it stops talking right away to listen.
            </p>
          </div>

          <div className="bento-visual-surface" style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-monkey-charcoal)' }}>
                Interruption Handling
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-monkey-terracotta)',
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                }}
              >
                Pauses Instantly
              </span>
            </div>
            <div style={{ display: 'flex', gap: '4px', height: '36px', alignItems: 'center' }}>
              {[35, 65, 95, 45, 80, 100, 70, 45, 90, 60, 30, 75, 95, 50, 70, 85, 40, 60, 90, 75, 45, 80, 55].map(
                (val, idx) => (
                  <span
                    key={idx}
                    style={{
                      flex: 1,
                      height: `${val}%`,
                      backgroundColor:
                        idx >= 8 && idx <= 14
                          ? 'var(--color-monkey-terracotta)'
                          : idx > 14 && idx <= 18
                          ? 'var(--color-monkey-ochre)'
                          : 'rgba(0, 0, 0, 0.12)',
                      borderRadius: '4px',
                      transition: 'height 0.2s ease',
                    }}
                  />
                )
              )}
            </div>
          </div>
        </div>

        {/* Bento Card 2: Span 4 (Terracotta Accent Card) */}
        <div className="bento-card bento-span-4 bento-theme-terracotta">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span
                className="bento-pill-tag"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  color: '#ffffff',
                }}
              >
                WhatsApp Sharing
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, opacity: 0.85 }}>02 / 05</span>
            </div>
            <h3 className="bento-card-title" style={{ color: '#ffffff' }}>WhatsApp Details While on Call</h3>
            <p className="bento-card-desc" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>
              Sends your product catalog, store link, or brochure to WhatsApp during the call.
            </p>
          </div>

          <div className="bento-visual-surface" style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ffffff' }}>
              <FaWhatsapp color="#25D366" size={18} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>WhatsApp Dispatch</span>
            </div>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                padding: '8px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11.5px',
                color: '#ffffff',
              }}
            >
              <FiFileText size={15} />
              <span style={{ fontWeight: 500 }}>Product_Catalog.pdf</span>
              <span
                style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#bbf7d0',
                }}
              >
                <FiCheck size={12} /> DELIVERED
              </span>
            </div>
          </div>
        </div>

        {/* Bento Card 3: Span 4 (Ochre Light Card) */}
        <div className="bento-card bento-span-4 bento-theme-ochre-light">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span
                className="bento-pill-tag"
                style={{
                  backgroundColor: 'var(--color-monkey-ochre-badge)',
                  color: 'var(--color-monkey-ochre-dark)',
                }}
              >
                Easy Scheduling
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-monkey-ochre-dark)' }}>
                03 / 05
              </span>
            </div>
            <h3 className="bento-card-title">Simple Calendar Appointments</h3>
            <p className="bento-card-desc">
              Understands requests like "call me tomorrow at 3 PM" and sends a calendar invite right away.
            </p>
          </div>

          <div className="bento-visual-surface" style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
              <span style={{ color: '#78716c' }}>Detected: "Tomorrow afternoon"</span>
              <span style={{ color: 'var(--color-monkey-ochre-dark)', fontWeight: 700 }}>Auto-Booked</span>
            </div>
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '10px 14px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <FiCalendar size={18} color="var(--color-monkey-ochre-dark)" />
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-monkey-charcoal)' }}>
                  Confirmed: 3:00 PM Tomorrow
                </div>
                <div style={{ fontSize: '11px', color: '#78716c' }}>Calendar Invite Sent to Both Parties</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Card 4: Span 4 (Sage Card) */}
        <div className="bento-card bento-span-4 bento-theme-sage">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span
                className="bento-pill-tag"
                style={{
                  backgroundColor: 'var(--color-monkey-sage-badge)',
                  color: 'var(--color-monkey-sage-dark)',
                }}
              >
                Always On-Brand
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-monkey-sage-dark)' }}>
                04 / 05
              </span>
            </div>
            <h3 className="bento-card-title">Approved Answers &amp; Reliable Pricing</h3>
            <p className="bento-card-desc">
              Shares only the prices, answers, and policies you approve in advance. Never invents discounts or unverified promises.
            </p>
          </div>

          <div className="bento-visual-surface" style={{ marginTop: '12px' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '10px 12px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--color-monkey-charcoal)' }}>
                <FiShield size={14} color="#16a34a" /> Approved Information Only
              </span>
              <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '11px' }}>VERIFIED</span>
            </div>
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '8px 12px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11.5px',
                color: '#78716c',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <span>Sticks to Your Facts</span>
              <span style={{ fontWeight: 600, color: 'var(--color-monkey-sage-dark)' }}>FOLLOWS SCRIPT</span>
            </div>
          </div>
        </div>

        {/* Bento Card 5: Span 4 (Plum Card) */}
        <div className="bento-card bento-span-4 bento-theme-plum">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span
                className="bento-pill-tag"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  color: '#ffffff',
                }}
              >
                Languages Supported
              </span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
                05 / 05
              </span>
            </div>
            <h3 className="bento-card-title">4 Indian Languages</h3>
            <p className="bento-card-desc">
              Speaks English, Hindi, Kannada, and Telugu with natural regional pronunciation and clear flow.
            </p>
          </div>

          <div className="bento-visual-surface" style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { name: 'English (India)', code: 'EN' },
                { name: 'हिंदी (Hindi)', code: 'HI' },
                { name: 'ಕನ್ನಡ (Kannada)', code: 'KN' },
                { name: 'తెలుగు (Telugu)', code: 'TE' },
              ].map((lang) => (
                <span
                  key={lang.code}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    padding: '5px 10px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--color-monkey-plum-dark)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <FiGlobe size={11} /> {lang.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

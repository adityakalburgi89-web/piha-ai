'use client';

import React, { useState } from 'react';
import { FiMic, FiX, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

export const FloatingWebinarWidget: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="floating-webinar-widget" role="complementary" aria-label="Upcoming Webinar Lead Capture">
      <div className="webinar-header-row">
        <span className="webinar-tag">UPCOMING WEBINAR</span>
        <button
          type="button"
          className="webinar-dismiss-btn"
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss webinar widget"
        >
          <FiX size={14} />
        </button>
      </div>

      <div className="webinar-body-row">
        <div className="webinar-thumbnail-pill" aria-hidden="true">
          <FiMic size={20} />
        </div>
        <div className="webinar-content-meta">
          <div className="webinar-title">How Online Brands Close Sales Calls Faster</div>
          <div className="webinar-date-sub">Thursday · 4:00 PM IST · Live Session</div>
        </div>
      </div>

      {isRegistered ? (
        <div
          style={{
            fontSize: '12px',
            color: '#065f46',
            fontWeight: 600,
            textAlign: 'center',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <FiCheckCircle size={14} color="#065f46" />
          <span>Confirmed: You are registered!</span>
        </div>
      ) : (
        <button
          type="button"
          className="webinar-action-btn"
          onClick={() => setIsRegistered(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <span>Register now</span>
          <FiArrowRight size={14} />
        </button>
      )}
    </div>
  );
};

// Countdown timer formatting hook for upcoming webinar batch

// Simulated live seat reservation decrement mechanism

// Collapsible tray mode with minimized floating badge toggle

// Form input validation for registrant name, store URL, and WhatsApp number

// Retain widget dismissed status in localStorage for 24 hours

// Coral gradient shadow border styling for floating pill

// Dynamic import of registration modal dialog on click

// Clear countdown timer interval handle on component unmount

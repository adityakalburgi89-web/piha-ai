'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { FaLinkedin, FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

interface FooterProps {
  onOpenDialer?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDialer }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <footer className="colabs-footer-wrapper">
      <div className="colabs-footer-container">
        {/* Top Row: Two Rounded Cards */}
        <div className="colabs-top-row">
          {/* Left Card: Lab Picture (Monkey.gif) with Teal Tag */}
          <div className="colabs-image-card">
            <div className="colabs-photo-wrapper">
              <Image
                src="/assets/Gif/Monkey.gif"
                alt="Piha AI Labs"
                fill
                unoptimized
                className="colabs-photo-img"
                sizes="(max-width: 768px) 100vw, 42vw"
                priority
              />
            </div>
          </div>

          {/* Right Card: Cobalt Blue CTA Card */}
          <div className="colabs-cta-card">
            <h2 className="colabs-cta-heading">
              Building what your business needs takes a voice that connects. Try Piha AI.
            </h2>

            {submitted ? (
              <div className="colabs-submitted-notice">
                <div className="colabs-submitted-badge">
                  <FiCheck size={18} />
                  <span>Thank you for subscribing!</span>
                </div>
                <p>We will keep you updated with the latest Piha AI updates and announcements.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="colabs-cta-form">
                <div className="colabs-form-group">
                  <label className="colabs-form-label" htmlFor="colabs-email">
                    Email *
                  </label>
                  <input
                    id="colabs-email"
                    type="email"
                    className="colabs-form-input"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="colabs-form-group">
                  <label className="colabs-form-label" htmlFor="colabs-firstname">
                    First Name *
                  </label>
                  <input
                    id="colabs-firstname"
                    type="text"
                    className="colabs-form-input"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="colabs-cta-bottom-bar">
                  <p className="colabs-subtext">
                    Subscribe for product updates and announcements.
                  </p>

                  <button type="submit" className="colabs-submit-btn" aria-label="Submit form">
                    <span className="colabs-submit-text">Submit</span>
                    <span className="colabs-submit-arrow-circle">
                      <FiArrowRight size={17} color="#ffffff" />
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Card: Dark Slate/Charcoal Panel */}
        <div className="colabs-dark-panel">
          {/* Main Info Grid */}
          <div className="colabs-dark-grid">
            {/* Left Column: Locations & Navigation Links (Shifted to Left Side) */}
            <div className="colabs-details-column">
              {/* 4 Hub Locations (2x2 Grid) */}
              <div className="colabs-locations-grid">
                <div className="colabs-location-item">
                  <div className="colabs-location-name">Piha AI Indiranagar</div>
                  <div className="colabs-location-address">
                    100 Feet Rd, Indiranagar,
                    <br />
                    Bengaluru KA 560038
                  </div>
                  <div className="colabs-location-phone">+91 80 4123 4567</div>
                </div>

                <div className="colabs-location-item">
                  <div className="colabs-location-name">Piha AI BKC</div>
                  <div className="colabs-location-address">
                    Bandra Kurla Complex, Bandra E,
                    <br />
                    Mumbai MH 400051
                  </div>
                  <div className="colabs-location-phone">+91 22 6123 4567</div>
                </div>

                <div className="colabs-location-item">
                  <div className="colabs-location-name">Piha AI Cyber City</div>
                  <div className="colabs-location-address">
                    DLF Cyber City, Phase 2,
                    <br />
                    Gurugram HR 122002
                  </div>
                  <div className="colabs-location-phone">+91 124 4123 456</div>
                </div>

                <div className="colabs-location-item">
                  <div className="colabs-location-name">Piha AI Hitec City</div>
                  <div className="colabs-location-address">
                    Cyber Towers, Madhapur,
                    <br />
                    Hyderabad TS 500081
                  </div>
                  <div className="colabs-location-phone">+91 40 4123 4567</div>
                </div>
              </div>

              {/* 2-Column Links Row */}
              <div className="colabs-links-row">
                <ul className="colabs-nav-column">
                  <li>
                    <a href="#features" className="colabs-link">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#how-it-works" className="colabs-link">
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a href="#voices" className="colabs-link">
                      Sample Voices
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="colabs-link">
                      Common Questions
                    </a>
                  </li>
                  <li>
                    <a href="#voices" className="colabs-link">
                      Book a Demo
                    </a>
                  </li>
                </ul>

                <ul className="colabs-nav-column">
                  <li>
                    <a href="#privacy" className="colabs-link">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#terms" className="colabs-link">
                      Terms and Conditions
                    </a>
                  </li>
                  <li className="colabs-copyright-item">
                    <span>© {new Date().getFullYear()} Piha AI</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Screaming Piha Mascot Image & Brand Mission Statement */}
            <div className="colabs-statement-column colabs-piha-brand-col">
              <div className="colabs-piha-showcase-box">
                <div className="colabs-piha-avatar-wrap">
                  <Image
                    src="/assets/piha-img/Screming piha.jpg"
                    alt="Screaming Piha — Sonic Mascot"
                    width={180}
                    height={220}
                    className="colabs-piha-avatar-img"
                    priority
                  />
                </div>
              </div>

              <p className="colabs-statement-text">
                The screaming piha is a small, plain gray bird from South America famous for producing one of the loudest and most iconic calls in the Amazon rainforest.
              </p>
            </div>
          </div>

          {/* Bottom Row: Agency Credit, Large Brand Logo, Socials */}
          <div className="colabs-bottom-signature-row">
            {/* Left Credit */}
            <div className="colabs-credit-box">
              <span className="colabs-credit-label">Brand and platform by</span>
              <span className="colabs-credit-brand">Piha AI</span>
            </div>

            {/* Center Large Brand Logo */}
            <div className="colabs-center-logo">
              <span className="colabs-logo-mark" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="2.5" />
                  <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
                </svg>
              </span>
              <span className="colabs-logo-text">Piha AI</span>
            </div>

            {/* Right Social Media Icons */}
            <div className="colabs-social-cluster" aria-label="Social media links">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="colabs-social-link"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="colabs-social-link"
                aria-label="Instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="colabs-social-link"
                aria-label="Facebook"
              >
                <FaFacebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="colabs-social-link"
                aria-label="Twitter"
              >
                <FaTwitter size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

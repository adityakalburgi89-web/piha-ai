'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import Image from 'next/image';

interface NavbarProps {
  onOpenDialer?: () => void;
  onOpenLiveKit?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDialer, onOpenLiveKit }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`site-nav-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <nav
        className={`site-nav-pill ${isScrolled ? 'is-compact' : ''}`}
        aria-label="Main Navigation"
      >
        {/* Logo Left with Piha Bird Voice Icon */}
        <Link href="/" className="nav-brand" aria-label="Piha AI Home">
          <span className="nav-wave-icon" aria-hidden="true">
            <Image
              src="/images/icons/Piha.webp"
              alt="Piha AI Logo"
              width={34}
              height={22}
              priority
              style={{ objectFit: 'contain', width: 'auto', height: '22px', display: 'block' }}
            />
          </span>
          <span className="nav-brand-title">Piha AI</span>
        </Link>

        {/* Centered Nav Links (smoothly collapses and hides on scroll) */}
        <ul className={`nav-links-list ${isScrolled ? 'hidden-links' : ''}`}>
          <li>
            <a href="/#features" className="nav-item-link">Features</a>
          </li>
          <li>
            <a href="/#voices" className="nav-item-link">Voices</a>
          </li>
          <li>
            <a href="/#how-it-works" className="nav-item-link">How It Works</a>
          </li>
          <li>
            <a href="/#faq" className="nav-item-link">FAQ</a>
          </li>
        </ul>

        {/* Actions Right: Book a Demo + Log in */}
        <div className="nav-actions-cluster">
          <a href="#voices" className="nav-btn-demo" id="nav-demo-btn">
            Book a demo
          </a>
          <Link href="/login" className="nav-btn-login" id="nav-login-btn">
            Log in
          </Link>
        </div>
      </nav>
    </header>
  );
};

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiPhone, FiLogOut } from 'react-icons/fi';
import { AnalyticsViewTab } from '@/components/dashboard/AnalyticsViewTab';
import { QuickDialModal } from '@/components/dialer/QuickDialModal';

export default function AnalyticsPage() {
  const [isDialerOpen, setIsDialerOpen] = useState(false);

  return (
    <div className="dashboard-viewport">
      {/* Top Floating Glass Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          {/* Left Brand Identity */}
          <Link href="/dashboard" className="dashboard-brand">
            <span className="dashboard-brand-icon">
              <Image
                src="/images/icons/Piha.webp"
                alt="Piha AI"
                width={36}
                height={24}
                priority
                style={{ objectFit: 'contain', height: '24px', width: 'auto' }}
              />
            </span>
            <span className="dashboard-brand-name">Piha AI</span>
            <span className="dashboard-badge-pill">Analytics</span>
          </Link>

          {/* Navigation Links */}
          <nav className="dashboard-nav-tabs">
            <Link href="/dashboard" className="dash-tab-btn" style={{ textDecoration: 'none' }}>
              Dashboard
            </Link>
            <span className="dash-tab-btn active">
              Call Performance
            </span>
            <Link href="/" className="dash-tab-btn" style={{ textDecoration: 'none' }}>
              Landing Page
            </Link>
          </nav>

          {/* Right Action Cluster */}
          <div className="dashboard-user-cluster">
            <button
              type="button"
              className="dash-btn-call"
              onClick={() => setIsDialerOpen(true)}
            >
              <FiPhone size={15} />
              <span>Make a Test Call</span>
            </button>

            <Link href="/dashboard" className="dash-btn-logout" title="Back to Dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <FiArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="dashboard-main-content">
        <AnalyticsViewTab onTriggerCall={() => setIsDialerOpen(true)} />
      </main>

      {/* Quick Dial Modal */}
      <QuickDialModal isOpen={isDialerOpen} onClose={() => setIsDialerOpen(false)} />
    </div>
  );
}

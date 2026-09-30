'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/hero/HeroSection';
import { StickyFeaturesSection } from '@/components/features/StickyFeaturesSection';
import { CoralDiagonalMarquee } from '@/components/decorative/CoralDiagonalMarquee';
import { VoiceShowcaseSection } from '@/components/voice-player/VoiceShowcaseSection';
import { HowItWorksSection } from '@/components/architecture/HowItWorksSection';
import { FAQSection } from '@/components/faq/FAQSection';
import { Footer } from '@/components/layout/Footer';
import { QuickDialModal } from '@/components/dialer/QuickDialModal';
import { LiveKitVoiceModal } from '@/components/livekit/LiveKitVoiceModal';

export default function HomePage() {
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [isLiveKitOpen, setIsLiveKitOpen] = useState(false);

  useEffect(() => {
    const handleOpenDialer = () => setIsDialerOpen(true);
    const handleOpenLiveKit = () => setIsLiveKitOpen(true);

    window.addEventListener('elevatevoice:open-dialer', handleOpenDialer);
    window.addEventListener('piha:open-livekit', handleOpenLiveKit);

    return () => {
      window.removeEventListener('elevatevoice:open-dialer', handleOpenDialer);
      window.removeEventListener('piha:open-livekit', handleOpenLiveKit);
    };
  }, []);

  return (
    <>
      <Navbar
        onOpenDialer={() => setIsDialerOpen(true)}
        onOpenLiveKit={() => setIsLiveKitOpen(true)}
      />

      <HeroSection
        onOpenDialer={() => setIsDialerOpen(true)}
        onOpenLiveKit={() => setIsLiveKitOpen(true)}
      />

      <main className="page-wrapper">
        <StickyFeaturesSection />
      </main>

      {/* Decorative Diagonal Coral Marquee Ribbon */}
      <CoralDiagonalMarquee />

      <main className="page-wrapper">
        <VoiceShowcaseSection />
        <HowItWorksSection />
        <FAQSection />
      </main>

      <Footer onOpenDialer={() => setIsDialerOpen(true)} />

      {/* Interactive Quick Dial Modal (PSTN Phone) */}
      <QuickDialModal isOpen={isDialerOpen} onClose={() => setIsDialerOpen(false)} />

      {/* Interactive Real-Time LiveKit WebRTC Voice Room Modal */}
      <LiveKitVoiceModal isOpen={isLiveKitOpen} onClose={() => setIsLiveKitOpen(false)} />
    </>
  );
}
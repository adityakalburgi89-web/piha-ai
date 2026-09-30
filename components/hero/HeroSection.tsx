'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FiArrowRight,
  FiMic,
  FiVolume2,
  FiChevronDown,
  FiPlay,
  FiPause,
} from 'react-icons/fi';
import dynamic from 'next/dynamic';
import type { OrbState } from 'orb-ui';

const Orb = dynamic(() => import('orb-ui').then((m) => m.Orb), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: 210,
        height: 210,
        borderRadius: '50%',
        backgroundColor: '#fafafa',
        border: '1px solid #ededed',
      }}
    />
  ),
});

interface HeroSectionProps {
  onOpenDialer?: () => void;
  onOpenLiveKit?: () => void;
}

const samplePromptsByLang: Record<string, { prompt: string; response: string; audioSrc: string }> = {
  'en-IN': {
    prompt: 'Hi! Do you help set up custom online stores with payment gateways?',
    response:
      'Yes, we do! We build custom online stores with payment gateways and order tracking. What kinds of products are you planning to sell?',
    audioSrc: '/audio/english.mp3',
  },
  'hi-IN': {
    prompt: 'à¤¨à¤®à¤¸à¥à¤¤à¥‡! à¤•à¥à¤¯à¤¾ à¤†à¤ª à¤‘à¤¨à¤²à¤¾à¤‡à¤¨ à¤¸à¥à¤Ÿà¥‹à¤° à¤•à¥‡ à¤²à¤¿à¤ à¤ªà¥‡à¤®à¥‡à¤‚à¤Ÿ à¤—à¥‡à¤Ÿà¤µà¥‡ à¤¸à¥‡à¤Ÿà¤…à¤ª à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚?',
    response:
      'à¤œà¥€ à¤¹à¤¾à¤! à¤¹à¤® à¤‘à¤¨à¤²à¤¾à¤‡à¤¨ à¤¸à¥à¤Ÿà¥‹à¤° à¤”à¤° à¤ªà¥‡à¤®à¥‡à¤‚à¤Ÿ à¤¸à¥‡à¤Ÿà¤…à¤ª à¤®à¥‡à¤‚ à¤®à¤¦à¤¦ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤†à¤ª à¤•à¤¿à¤¸ à¤¤à¤°à¤¹ à¤•à¥‡ à¤ªà¥à¤°à¥‹à¤¡à¤•à¥à¤Ÿà¥à¤¸ à¤¬à¥‡à¤šà¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥‡ à¤¹à¥ˆà¤‚?',
    audioSrc: '/audio/hindi.mp3',
  },
  'kn-IN': {
    prompt: 'à²¨à²®à²¸à³à²•à²¾à²°! à²¹à³Šà²¸ à²†à²¨à³â€Œà²²à³ˆà²¨à³ à²¶à²¾à²ªà³ à²®à²¤à³à²¤à³ à²ªà³‡à²®à³†à²‚à²Ÿà³ à²¸à³†à²Ÿà²ªà³ à²®à²¾à²¡à²¿à²•à³Šà²¡à³à²¤à³à²¤à³€à²°à²¾?',
    response:
      'à²–à²‚à²¡à²¿à²¤! à²¨à²¾à²µà³ à²†à²¨à³â€Œà²²à³ˆà²¨à³ à²¶à²¾à²ªà³ à²®à²¤à³à²¤à³ à²ªà²¾à²µà²¤à²¿ à²µà³à²¯à²µà²¸à³à²¥à³†à²¯à²¨à³à²¨à³ à²¸à³†à²Ÿà²ªà³ à²®à²¾à²¡à²¿à²•à³Šà²¡à³à²¤à³à²¤à³‡à²µà³†. à²¨à³€à²µà³ à²¯à²¾à²µ à²ªà³à²°à²¾à²¡à²•à³à²Ÿà³â€Œà²—à²³à²¨à³à²¨à³ à²®à²¾à²°à²¾à²Ÿ à²®à²¾à²¡à²²à³ à²¯à³‹à²œà²¿à²¸à³à²¤à³à²¤à²¿à²¦à³à²¦à³€à²°à²¿?',
    audioSrc: '/audio/kannada.mp3',
  },
  'te-IN': {
    prompt: 'à°¨à°®à°¸à±à°•à°¾à°°à°‚! à°•à±Šà°¤à±à°¤ à°†à°¨à±â€Œà°²à±ˆà°¨à± à°¸à±à°Ÿà±‹à°°à± à°®à°°à°¿à°¯à± à°ªà±‡à°®à±†à°‚à°Ÿà± à°—à±‡à°Ÿà±â€Œà°µà±‡ à°¸à±†à°Ÿà°ªà± à°šà±‡à°¸à°¿à°¸à±à°¤à°¾à°°à°¾?',
    response:
      'à°–à°šà±à°šà°¿à°¤à°‚à°—à°¾! à°®à±‡à°®à± à°†à°¨à±â€Œà°²à±ˆà°¨à± à°¸à±à°Ÿà±‹à°°à± à°®à°°à°¿à°¯à± à°ªà±‡à°®à±†à°‚à°Ÿà± à°—à±‡à°Ÿà±â€Œà°µà±‡ à°¸à±†à°Ÿà°ªà± à°šà±‡à°¸à±à°¤à°¾à°®à±. à°®à±€à°°à± à° à°°à°•à°®à±ˆà°¨ à°µà°¸à±à°¤à±à°µà±à°²à°¨à± à°…à°®à±à°®à°¾à°²à°¨à±à°•à±à°‚à°Ÿà±à°¨à±à°¨à°¾à°°à±?',
    audioSrc: '/audio/telugu.mp3',
  },
};


export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDialer, onOpenLiveKit }) => {
  const [activeTab, setActiveTab] = useState<'stt' | 'tts'>('stt');
  const [selectedLang, setSelectedLang] = useState<string>('en-IN');
  // Always active in 'listening' animation by default!
  const [orbState, setOrbState] = useState<OrbState>('listening');
  const [outputVolume, setOutputVolume] = useState<number>(0.15);
  const [inputVolume, setInputVolume] = useState<number>(0.7);
  const [transcriptText, setTranscriptText] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Subtle continuous volume modulation while in 'listening' state so orb is constantly alive
  useEffect(() => {
    if (orbState === 'listening') {
      const interval = setInterval(() => {
        setInputVolume(0.45 + Math.random() * 0.4);
      }, 350);
      return () => clearInterval(interval);
    }
  }, [orbState]);

  // Sync with global orb events from quick dial or audio player if triggered
  useEffect(() => {
    const handleOrbEvent = (event: CustomEvent<{ state: OrbState; volume?: number }>) => {
      if (event.detail && event.detail.state) {
        setOrbState(event.detail.state);
        if (typeof event.detail.volume === 'number') {
          setOutputVolume(event.detail.volume);
        }
      }
    };

    window.addEventListener('elevatevoice:orb-state' as any, handleOrbEvent as EventListener);
    return () => {
      window.removeEventListener('elevatevoice:orb-state' as any, handleOrbEvent as EventListener);
    };
  }, []);

  // Trigger simulated answer & speech playback, then return automatically to listening animation
  const triggerAnswer = (customText?: string) => {
    if (orbState === 'speaking') {
      // If currently speaking, return to listening animation
      setOrbState('listening');
      setInputVolume(0.7);
      setOutputVolume(0.15);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    setOrbState('thinking');
    setInputVolume(0.1);
    const langData = samplePromptsByLang[selectedLang] || samplePromptsByLang['en-IN'];
    setTranscriptText(`Piha AI: "${customText || langData.response}"`);

    setTimeout(() => {
      setOrbState('speaking');
      setOutputVolume(0.85);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => { });
      }

      // Automatically revert back to continuous listening animation after answering
      setTimeout(() => {
        setOrbState('listening');
        setInputVolume(0.7);
        setOutputVolume(0.15);
      }, 5500);
    }, 800);
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setSelectedLang(lang);
    setTranscriptText('');
    setOrbState('listening');
    setInputVolume(0.7);
  };

  return (
    <section className="hero-block" id="hero">
      <div className="page-wrapper hero-intro-wrapper">
        {/* Fanned Multi-Channel Icons Arc (WhatsApp, Chat, Piha AI, Chrome, Phone) */}
        <div className="hero-icons-fan" aria-label="WhatsApp, Chat, Voice, Web, and Phone">
          {/* WhatsApp */}
          <div className="hero-fan-item fan-whatsapp">
            <img
              src="/images/icons/whatsapp.svg"
              alt="WhatsApp"
              width={35}
              height={35}
              className="fan-icon-img"
            />
          </div>

          {/* Chat / iMessage */}
          <div className="hero-fan-item fan-chat">
            <img
              src="/images/icons/chat.svg"
              alt="Chat"
              width={41}
              height={41}
              className="fan-icon-img"
            />
          </div>

          {/* Center Piha AI Mark (Elevated centerpiece) */}
          <div className="hero-fan-item fan-center">
            <img
              src="/images/icons/ringg.svg"
              alt="Piha AI"
              width={52}
              height={52}
              className="fan-icon-img"
            />
          </div>

          {/* Chrome / Web */}
          <div className="hero-fan-item fan-chrome">
            <img
              src="/images/icons/chrome.svg"
              alt="Web Browser"
              width={41}
              height={41}
              className="fan-icon-img"
            />
          </div>

          {/* Phone / Voice */}
          <div className="hero-fan-item fan-phone">
            <img
              src="/images/icons/phone.svg"
              alt="Voice Calls"
              width={35}
              height={35}
              className="fan-icon-img"
            />
          </div>
        </div>

        {/* Hero Headline Block: Centered layout, 56px weight 700, line-height 0.80 tight stack */}
        <h1 className="hero-display-headline">
          Close sales leads with voice, <br />
          spoken <span className="coral-accent">instantly</span> & cleanly.
        </h1>

        {/* Subtitle at 18px weight 500 in #0e0f10 */}
        <p className="hero-subtitle">
          Natural phone conversations for your business. Speaks English, Hindi, Kannada, and Telugu,
          answers questions clearly, and sends product details over WhatsApp while on call.
        </p>

        {/* Two CTAs: Filled primary + Outlined secondary */}
        <div className="hero-cta-stack">
          <a href="#voices" className="btn-coral" id="hero-demo-btn">
            <span>Book a demo</span>
            <FiArrowRight size={16} />
          </a>
          <a href="#how-it-works" className="btn-ghost" id="hero-how-it-works-btn">
            <span>How it works</span>
          </a>
        </div>
      </div>

      {/* Interactive Voice Stage */}
      <div className="voice-ai-stage">
        {/* Title */}
        <h2 className="voice-ai-heading">Try It Live. See How It Sounds.</h2>

        {/* Pill Segmented Tab Switcher */}
        <div className="voice-tab-bar" role="tablist">
          <button
            type="button"
            className={`voice-tab-btn ${activeTab === 'stt' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('stt');
              setTranscriptText('');
              setOrbState('listening');
            }}
          >
            <FiMic className="tab-icon" size={16} />
            <span>Voice Preview</span>
          </button>
          <button
            type="button"
            className={`voice-tab-btn ${activeTab === 'tts' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('tts');
              setTranscriptText('');
              setOrbState('listening');
            }}
          >
            <FiVolume2 className="tab-icon" size={16} />
            <span>Type &amp; Listen</span>
          </button>
        </div>

        {/* 2-Column Playground: Left Only Orb, Right Transcript Box */}
        <div className="voice-playground-grid" style={{ marginBottom: 0 }}>
          {/* Left Column: Only the pure Orb component */}
          <div
            className="orb-halo-wrapper"
            onClick={() => triggerAnswer()}
            style={{ cursor: 'pointer' }}
            title="Interactive Voice Demo"
          >
            <Orb
              theme="radial"
              state={orbState}
              signal={{
                state: orbState,
                outputVolume: orbState === 'speaking' ? outputVolume : 0.05,
                inputVolume: orbState === 'listening' ? inputVolume : 0.05,
              }}
              size={210}
              interactive={true}
              slotProps={{
                control: {
                  style: { display: 'none' },
                },
              }}
              onStart={() => triggerAnswer()}
              onStop={() => triggerAnswer()}
            />
          </div>

          {/* Right Column: Transcript / Text Area */}
          <div className="transcript-display-card">
            {activeTab === 'stt' ? (
              <div
                className={`transcript-message-area ${!transcriptText ? 'placeholder' : ''}`}
              >
                {transcriptText || 'Click below to hear a sample conversation...'}
              </div>
            ) : (
              <div>
                <textarea
                  className="transcript-message-area"
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'var(--font-inter)',
                    background: 'transparent',
                    minHeight: '90px',
                  }}
                  value={
                    transcriptText ||
                    (samplePromptsByLang[selectedLang] || samplePromptsByLang['en-IN']).prompt
                  }
                  onChange={(e) => setTranscriptText(e.target.value)}
                  placeholder="Type any question to hear how the voice responds..."
                />
                <button
                  type="button"
                  className="btn-coral"
                  style={{ padding: '8px 16px', fontSize: '13px', marginTop: '8px' }}
                  onClick={() => triggerAnswer(transcriptText)}
                >
                  {orbState === 'speaking' ? (
                    <>
                      <FiPause size={14} />
                      <span>Pause Voice</span>
                    </>
                  ) : (
                    <>
                      <FiPlay size={14} />
                      <span>Hear Voice Reply</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Bottom Toolbar with Language Selector */}
            <div className="transcript-bottom-toolbar">
              <div className="lang-select-wrapper">
                <select
                  className="lang-dropdown-select"
                  value={selectedLang}
                  onChange={handleLangChange}
                  aria-label="Select spoken language"
                >
                  <option value="en-IN">English (India)</option>
                  <option value="hi-IN">Hindi (India)</option>
                  <option value="kn-IN">Kannada (India)</option>
                  <option value="te-IN">Telugu (India)</option>
                </select>
                <FiChevronDown className="lang-dropdown-chevron" size={14} />
              </div>

              {activeTab === 'stt' && (
                <button
                  type="button"
                  className="hear-sample-btn"
                  onClick={() => triggerAnswer()}
                >
                  {orbState === 'speaking' ? 'Pause Voice' : 'Hear Sample Conversation â†’'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Audio Element for voice preview */}
        <audio
          ref={audioRef}
          src={(samplePromptsByLang[selectedLang] || samplePromptsByLang['en-IN']).audioSrc}
          onEnded={() => {
            setOrbState('listening');
            setInputVolume(0.7);
            setOutputVolume(0.15);
          }}
          preload="none"
        />
      </div>
    </section>
  );
};

// Dynamic live indicator badge attached to voice session header

// High-conversion sales headline & multilingual qualification badge

// Audio wave amplitude visualizer anchor

// Optimized image preloading & priority tags configured

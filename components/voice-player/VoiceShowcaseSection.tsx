'use client';

import React, { useState, useRef } from 'react';
import { FiPlay, FiPause, FiVolume2, FiRadio } from 'react-icons/fi';

interface VoiceTrackInfo {
  id: string;
  lang: string;
  langNative: string;
  title: string;
  subtitle: string;
  quote: string;
  src: string;
  durationSec: number;
  themeClass: string;
  spanClass: string;
  badgeBg: string;
  badgeColor: string;
}

const tracks: VoiceTrackInfo[] = [
  {
    id: 'en',
    lang: 'ENGLISH',
    langNative: 'English (India)',
    title: 'English Customer Call',
    subtitle: 'Clear, polite, and natural tone for customer inquiries.',
    quote: '"Hello! This is Neha from Piha AI regarding your store inquiry. Do you have a quick minute to chat?"',
    src: '/audio/english.mp3',
    durationSec: 8,
    themeClass: 'bento-theme-sand',
    spanClass: 'bento-span-7',
    badgeBg: 'var(--color-monkey-terracotta-badge)',
    badgeColor: 'var(--color-monkey-terracotta-dark)',
  },
  {
    id: 'hi',
    lang: 'HINDI',
    langNative: 'हिंदी',
    title: 'Hindi Product Inquiry',
    subtitle: 'Warm and natural conversational Hindi.',
    quote: '"नमस्ते! मैं पिहा एआई से बात कर रही हूँ। क्या आपके पास स्टोर की जानकारी के लिए एक मिनट का समय है?"',
    src: '/audio/hindi.mp3',
    durationSec: 9,
    themeClass: 'bento-theme-ochre-light',
    spanClass: 'bento-span-5',
    badgeBg: 'var(--color-monkey-ochre-badge)',
    badgeColor: 'var(--color-monkey-ochre-dark)',
  },
  {
    id: 'kn',
    lang: 'KANNADA',
    langNative: 'ಕನ್ನಡ',
    title: 'Kannada Store Support',
    subtitle: 'Friendly and authentic spoken Kannada.',
    quote: '"ನಮಸ್ಕಾರ! ನಾನು ಪಿಹಾ ಎಐ ಕಡೆಯಿಂದ ಕರೆ ಮಾಡುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮ ಶಾಪ್ ವಿಚಾರವಾಗಿ ಒಂದು ನಿಮಿಷ ಮಾತನಾಡಬಹುದೇ?"',
    src: '/audio/kannada.mp3',
    durationSec: 10,
    themeClass: 'bento-theme-sage',
    spanClass: 'bento-span-6',
    badgeBg: 'var(--color-monkey-sage-badge)',
    badgeColor: 'var(--color-monkey-sage-dark)',
  },
  {
    id: 'te',
    lang: 'TELUGU',
    langNative: 'తెలుగు',
    title: 'Telugu Order Assistance',
    subtitle: 'Helpful and polite spoken Telugu.',
    quote: '"నమస్కారం! నేను పిహా ఏఐ నుండి కాల్ చేస్తున్నాను. మీ స్టోర్ వివరాల గురించి ఒక నిమిషం మాట్లాడవచ్చా?"',
    src: '/audio/telugu.mp3',
    durationSec: 10,
    themeClass: 'bento-theme-plum',
    spanClass: 'bento-span-6',
    badgeBg: '#EBDDE4',
    badgeColor: 'var(--color-monkey-plum-dark)',
  },
];

export const VoiceShowcaseSection: React.FC = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  const togglePlay = (id: string) => {
    if (playingId === id) {
      if (audioRefs.current[id]) {
        audioRefs.current[id]?.pause();
      }
      setPlayingId(null);
      window.dispatchEvent(
        new CustomEvent('elevatevoice:orb-state', { detail: { state: 'idle', volume: 0 } })
      );
    } else {
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId]?.pause();
      }

      setPlayingId(id);
      window.dispatchEvent(
        new CustomEvent('elevatevoice:orb-state', { detail: { state: 'speaking', volume: 0.85 } })
      );

      const audio = audioRefs.current[id];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          let sec = 0;
          const track = tracks.find((t) => t.id === id);
          const total = track ? track.durationSec : 8;
          const interval = setInterval(() => {
            sec += 1;
            setProgress((prev) => ({ ...prev, [id]: (sec / total) * 100 }));
            if (sec >= total) {
              clearInterval(interval);
              setPlayingId(null);
              setProgress((prev) => ({ ...prev, [id]: 0 }));
              window.dispatchEvent(
                new CustomEvent('elevatevoice:orb-state', { detail: { state: 'idle', volume: 0 } })
              );
            }
          }, 1000);
        });
      }
    }
  };

  const handleTimeUpdate = (id: string) => {
    const audio = audioRefs.current[id];
    if (audio) {
      const pct = (audio.currentTime / (audio.duration || 1)) * 100;
      setProgress((prev) => ({ ...prev, [id]: pct }));
    }
  };

  const handleEnded = (id: string) => {
    setPlayingId(null);
    setProgress((prev) => ({ ...prev, [id]: 0 }));
    window.dispatchEvent(
      new CustomEvent('elevatevoice:orb-state', { detail: { state: 'idle', volume: 0 } })
    );
  };

  return (
    <section className="section bento-section" id="voices">
      <div className="section-header bento-header">
        <span
          className="bento-badge"
          style={{
            backgroundColor: 'var(--color-monkey-terracotta-badge)',
            color: 'var(--color-monkey-terracotta-dark)',
          }}
        >
          <FiRadio size={13} /> Voice Samples
        </span>
        <h2 className="section-title">Hear Real Conversations</h2>
        <p className="section-subhead">
          Listen to sample calls across 4 Indian languages. Clear accents, friendly tone, and natural pacing.
        </p>
      </div>

      <div className="bento-grid">
        {tracks.map((track) => {
          const isPlaying = playingId === track.id;
          const trackProgress = progress[track.id] || 0;

          return (
            <div
              className={`bento-card ${track.spanClass} ${track.themeClass}`}
              key={track.id}
              style={{
                boxShadow: isPlaying ? '0 12px 36px rgba(184, 94, 50, 0.16)' : undefined,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className="bento-pill-tag"
                      style={{
                        backgroundColor: track.badgeBg,
                        color: track.badgeColor,
                      }}
                    >
                      {track.lang}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-monkey-charcoal)', opacity: 0.65 }}>
                      {track.langNative}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      color: isPlaying ? 'var(--color-monkey-terracotta)' : '#78716c',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isPlaying ? '● PLAYING' : 'AUDIO SAMPLE'}
                  </span>
                </div>

                <h3 className="bento-card-title">{track.title}</h3>
                <p className="bento-card-desc" style={{ marginBottom: '16px' }}>{track.subtitle}</p>

                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: 'var(--color-monkey-charcoal)',
                    fontStyle: 'italic',
                    marginBottom: '24px',
                    boxShadow: '0 1px 6px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  {track.quote}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button
                    type="button"
                    onClick={() => togglePlay(track.id)}
                    aria-label={`Play ${track.title}`}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: isPlaying ? 'var(--color-monkey-terracotta)' : 'var(--color-monkey-charcoal)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                      transform: isPlaying ? 'scale(1.05)' : 'none',
                    }}
                  >
                    {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} style={{ marginLeft: '2px' }} />}
                  </button>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '3px', height: '22px', alignItems: 'center', marginBottom: '8px' }}>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <span
                          key={i}
                          style={{
                            flex: 1,
                            height: isPlaying ? `${20 + ((i * 17) % 80)}%` : '20%',
                            backgroundColor:
                              i / 24 <= trackProgress / 100
                                ? 'var(--color-monkey-terracotta)'
                                : 'rgba(0, 0, 0, 0.12)',
                            borderRadius: '3px',
                            transition: 'height 0.15s ease',
                          }}
                        />
                      ))}
                    </div>

                    <div
                      style={{
                        height: '4px',
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        borderRadius: '9999px',
                        overflow: 'hidden',
                        marginBottom: '6px',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${trackProgress}%`,
                          backgroundColor: 'var(--color-monkey-terracotta)',
                          borderRadius: '9999px',
                          transition: 'width 0.1s linear',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#78716c', fontWeight: 600 }}>
                      <span>
                        {isPlaying
                          ? `${Math.round((trackProgress / 100) * track.durationSec)}s`
                          : '0:00'}
                      </span>
                      <span>{track.durationSec}s</span>
                    </div>
                  </div>
                </div>

                <audio
                  ref={(el) => {
                    audioRefs.current[track.id] = el;
                  }}
                  src={track.src}
                  onTimeUpdate={() => handleTimeUpdate(track.id)}
                  onEnded={() => handleEnded(track.id)}
                  preload="none"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
// Dynamic volume gain node and mute toggle control

// Audio state machine hook extracting duration, buffering, and time updates

// Debounce seek adjustments to avoid audio decode buffer stutter

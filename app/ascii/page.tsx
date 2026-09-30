'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { InteractiveMouseAscii } from '@/components/ui/InteractiveMouseAscii';
import { FiMove, FiSliders, FiType } from 'react-icons/fi';

export default function AsciiDemoPage() {
  const [inputText, setInputText] = useState('ELEVATE');
  const [cellSize, setCellSize] = useState(13);
  const [radius, setRadius] = useState(130);

  return (
    <>
      <Navbar />

      <main className="page-wrapper" style={{ padding: '48px 24px', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--color-ink)',
              marginBottom: '8px',
            }}
          >
            Interactive ASCII Playground
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-ash)',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Move your mouse across the canvas below to interact with the ASCII particles in real time.
          </p>
        </div>

        {/* Live Controls Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--color-pure-paper)',
            border: '1px solid var(--color-soft-mist)',
            padding: '16px 24px',
            borderRadius: '12px',
            marginBottom: '24px',
          }}
        >
          {/* Text Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiType size={16} color="var(--color-ash)" />
            <label htmlFor="ascii-text-input" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
              Text:
            </label>
            <input
              id="ascii-text-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value.toUpperCase())}
              maxLength={10}
              style={{
                background: 'var(--surface-fog)',
                border: '1px solid var(--color-soft-mist)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-ink)',
                width: '120px',
                textTransform: 'uppercase',
                outline: 'none',
              }}
            />
          </div>

          {/* Cell Size Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiSliders size={16} color="var(--color-ash)" />
            <label htmlFor="ascii-cell-slider" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
              Grid Size: ({cellSize}px)
            </label>
            <input
              id="ascii-cell-slider"
              type="range"
              min="8"
              max="22"
              value={cellSize}
              onChange={(e) => setCellSize(Number(e.target.value))}
              style={{ cursor: 'pointer' }}
            />
          </div>

          {/* Mouse Radius Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiMove size={16} color="var(--color-ash)" />
            <label htmlFor="ascii-radius-slider" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
              Mouse Radius: ({radius}px)
            </label>
            <input
              id="ascii-radius-slider"
              type="range"
              min="60"
              max="240"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* The Interactive ASCII Canvas */}
        <InteractiveMouseAscii
          textMask={inputText}
          cellSize={cellSize}
          radius={radius}
          mode="repel"
        />

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12.5px', color: 'var(--color-ash)' }}>
          💡 Tip: Use the top-right buttons on the canvas to toggle between <strong>Magnetic Push</strong>, <strong>Water Ripple</strong>, and <strong>Matrix Scramble</strong>!
        </div>
      </main>

      <Footer />
    </>
  );
}

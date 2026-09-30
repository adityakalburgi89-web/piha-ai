'use client';

import React, { useEffect, useRef, useState } from 'react';

// Character ramps from sparse to dense
const DENSE_RAMP = ' .:-=+*#%@';
const MATRIX_RAMP = '01ｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂ';
const SCRAMBLE_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

interface Particle {
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseChar: string;
}

interface InteractiveMouseAsciiProps {
  mode?: 'repel' | 'wave' | 'scramble';
  textMask?: string;
  cellSize?: number;
  radius?: number;
  className?: string;
}

export const InteractiveMouseAscii: React.FC<InteractiveMouseAsciiProps> = ({
  mode = 'repel',
  textMask = 'ELEVATE',
  cellSize = 14,
  radius = 120,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, isHovered: false });
  const [activeMode, setActiveMode] = useState<'repel' | 'wave' | 'scramble'>(mode);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    let time = 0;

    // 1. Build grid particles & sample text mask
    const initGrid = () => {
      const width = container.clientWidth || 800;
      const height = 480;
      canvas.width = width;
      canvas.height = height;

      // Draw text to an offscreen mask canvas to know which cells are inside the letters
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = width;
      maskCanvas.height = height;
      const maskCtx = maskCanvas.getContext('2d');

      if (maskCtx && textMask) {
        maskCtx.fillStyle = '#000000';
        maskCtx.fillRect(0, 0, width, height);
        maskCtx.fillStyle = '#ffffff';
        maskCtx.font = `bold ${Math.min(width * 0.16, 120)}px sans-serif`;
        maskCtx.textAlign = 'center';
        maskCtx.textBaseline = 'middle';
        maskCtx.fillText(textMask, width / 2, height / 2);
      }

      const maskData = maskCtx?.getImageData(0, 0, width, height).data;

      particles = [];
      const cols = Math.floor(width / cellSize);
      const rows = Math.floor(height / cellSize);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cellSize + cellSize / 2;
          const y = r * cellSize + cellSize / 2;

          // Check if this point falls inside the text mask
          const pixelIndex = (Math.floor(y) * width + Math.floor(x)) * 4;
          const isMasked = maskData ? maskData[pixelIndex] > 128 : true;

          // Pick character based on mask density
          let baseChar = '·';
          if (isMasked) {
            baseChar = DENSE_RAMP[Math.floor(Math.random() * 4) + 6]; // denser chars: # % @
          } else {
            baseChar = DENSE_RAMP[Math.floor(Math.random() * 3)]; // sparse chars: . :
          }

          particles.push({
            originX: x,
            originY: y,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            baseChar,
          });
        }
      }
    };

    initGrid();
    window.addEventListener('resize', initGrid);

    // Mouse Listeners
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isHovered: true,
      };
    };

    const onMouseLeave = () => {
      mouseRef.current.isHovered = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    // 2. Physics & Render Loop
    const render = () => {
      time += 0.04;
      const width = canvas.width;
      const height = canvas.height;

      // Dark background matching site aesthetic
      ctx.fillStyle = '#171c18';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `bold ${cellSize * 0.95}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const { x: mx, y: my } = mouseRef.current;
      const spring = 0.08; // Spring return speed
      const friction = 0.86; // Damping

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Calculate vector from mouse to particle
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.hypot(dx, dy);

        let displayChar = p.baseChar;
        let charColor = 'rgba(180, 205, 190, 0.25)';

        // === MOUSE INTERACTION MODES ===
        if (activeMode === 'repel') {
          // Physics: Push away from mouse
          if (dist < radius) {
            const force = (1 - dist / radius) * 18;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;

            // Highlight color near mouse
            const proximity = 1 - dist / radius;
            charColor = `rgba(45, 212, 191, ${0.4 + proximity * 0.6})`;
            displayChar = DENSE_RAMP[Math.min(9, Math.floor(proximity * 10))];
          }

          // Spring physics: pull back to origin
          const homeDx = p.originX - p.x;
          const homeDy = p.originY - p.y;
          p.vx += homeDx * spring;
          p.vy += homeDy * spring;
          p.vx *= friction;
          p.vy *= friction;
          p.x += p.vx;
          p.y += p.vy;

        } else if (activeMode === 'wave') {
          // Interactive ripple wave
          if (dist < radius * 1.6) {
            const wave = Math.sin(dist * 0.08 - time * 6);
            p.x = p.originX + (dx / (dist || 1)) * wave * 8;
            p.y = p.originY + (dy / (dist || 1)) * wave * 8;
            charColor = wave > 0 ? '#2dd4bf' : 'rgba(160, 190, 175, 0.4)';
            displayChar = wave > 0.5 ? '@' : wave > 0 ? '*' : '.';
          } else {
            p.x = p.originX;
            p.y = p.originY;
          }

        } else if (activeMode === 'scramble') {
          // Cyberpunk / Matrix character scramble
          if (dist < radius) {
            const randIdx = Math.floor(Math.random() * SCRAMBLE_CHARS.length);
            displayChar = SCRAMBLE_CHARS[randIdx];
            charColor = '#22c55e';
          } else {
            p.x = p.originX;
            p.y = p.originY;
          }
        }

        // Default highlight for letters
        if (p.baseChar === '@' || p.baseChar === '%' || p.baseChar === '#') {
          if (dist >= radius) {
            charColor = 'rgba(230, 245, 235, 0.85)';
          }
        }

        ctx.fillStyle = charColor;
        ctx.fillText(displayChar, p.x, p.y);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', initGrid);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [activeMode, textMask, cellSize, radius]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-[#2b332d] shadow-xl ${className}`}
      style={{ background: '#171c18' }}
    >
      {/* Interactive Mode Switcher Toolbar */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          display: 'flex',
          gap: '6px',
          zIndex: 10,
          background: 'rgba(23, 28, 24, 0.85)',
          backdropFilter: 'blur(6px)',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveMode('repel')}
          style={{
            padding: '4px 10px',
            fontSize: '11.5px',
            borderRadius: '4px',
            color: activeMode === 'repel' ? '#171c18' : '#cbd5e1',
            background: activeMode === 'repel' ? '#2dd4bf' : 'transparent',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Magnetic Push
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('wave')}
          style={{
            padding: '4px 10px',
            fontSize: '11.5px',
            borderRadius: '4px',
            color: activeMode === 'wave' ? '#171c18' : '#cbd5e1',
            background: activeMode === 'wave' ? '#2dd4bf' : 'transparent',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Water Ripple
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('scramble')}
          style={{
            padding: '4px 10px',
            fontSize: '11.5px',
            borderRadius: '4px',
            color: activeMode === 'scramble' ? '#171c18' : '#cbd5e1',
            background: activeMode === 'scramble' ? '#2dd4bf' : 'transparent',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Matrix Scramble
        </button>
      </div>

      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 480 }} />
    </div>
  );
};

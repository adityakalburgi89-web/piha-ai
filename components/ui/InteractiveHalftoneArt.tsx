'use client';

import React, { useEffect, useRef } from 'react';

interface DotParticle {
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  density: number;
}

const ASCII_RAMP = ' .:-=+*#%@';

interface InteractiveHalftoneArtProps {
  renderAscii?: boolean;
  theme?: 'light' | 'dark' | 'transparent';
  dotColor?: string;
}

export const InteractiveHalftoneArt: React.FC<InteractiveHalftoneArtProps> = ({
  renderAscii = false,
  theme = 'transparent',
  dotColor,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, isHovered: false });
  const isAscii = renderAscii;

  const ripplesRef = useRef<Array<{ x: number; y: number; radius: number; maxRadius: number; strength: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: DotParticle[] = [];
    let time = 0;

    const initGrid = () => {
      const width = container.clientWidth || 480;
      const height = container.clientHeight || 560;

      // Support retina displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const rows = 48;
      const cols = 38;
      const spacingX = width / cols;
      const spacingY = height / rows;

      particles = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacingX + spacingX / 2;
          const y = r * spacingY + spacingY / 2;

          // Normalized coordinates (0..1)
          const nx = c / cols;
          const ny = r / rows;

          // Center of dense black oval shape (offset slightly to right like screenshot)
          const centerX = 0.62;
          const centerY = 0.50;

          // Vertical oval distance formula matching exact reference topology
          const dx = (nx - centerX) / 0.44;
          const dy = (ny - centerY) / 0.52;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Smooth falloff curve
          let density = Math.max(0, 1 - dist);
          density = Math.pow(density, 0.82);

          // Subtle organic wave modulation
          const wave = Math.sin(ny * Math.PI * 2.2 + nx * 1.5) * 0.08;
          density = Math.min(1, Math.max(0, density + wave));

          // Base dot radius
          const baseRadius = 0.8 + density * 4.6;

          particles.push({
            originX: x,
            originY: y,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            baseRadius,
            density,
          });
        }
      }
    };

    initGrid();

    // Use ResizeObserver for accurate sizing on any layout update
    const resizeObserver = new ResizeObserver(() => {
      initGrid();
    });
    resizeObserver.observe(container);

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

    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ripplesRef.current.push({
        x,
        y,
        radius: 0,
        maxRadius: 280,
        strength: 22,
      });
    };

    // Touch Listeners
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
          isHovered: true,
        };
      }
    };

    const onTouchEnd = () => {
      mouseRef.current.isHovered = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        mouseRef.current = { x, y, isHovered: true };
        ripplesRef.current.push({
          x,
          y,
          radius: 0,
          maxRadius: 260,
          strength: 20,
        });
      }
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });

    // Animation & Physics Loop
    const render = () => {
      time += 0.04;
      const width = container.clientWidth || 480;
      const height = container.clientHeight || 560;

      ctx.clearRect(0, 0, width, height);

      // Light theme fallback background
      if (theme === 'light') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      // Update ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rip = ripplesRef.current[i];
        rip.radius += 5;
        rip.strength *= 0.94;
        if (rip.radius > rip.maxRadius || rip.strength < 0.2) {
          ripplesRef.current.splice(i, 1);
        }
      }

      const { x: mx, y: my } = mouseRef.current;
      const mouseRadius = 110;
      const spring = 0.08;
      const friction = 0.84;

      if (isAscii) {
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
      }

      const primaryDotColor = dotColor || (theme === 'light' ? '#111111' : 'rgba(255, 255, 255, 0.88)');
      const activeDotColor = theme === 'light' ? '#000000' : '#ffffff';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Mouse repulsion vector
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.hypot(dx, dy);

        let currentRadius = p.baseRadius;

        if (dist < mouseRadius) {
          const proximity = 1 - dist / mouseRadius;
          const force = proximity * 14;
          const angle = Math.atan2(dy, dx);

          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;

          // Subtle magnifying wave ripple on hover
          const wave = Math.sin(dist * 0.12 - time * 5);
          currentRadius = Math.max(0.4, p.baseRadius + wave * 1.6 * proximity);
        }

        // 2. Expand outward on click shockwaves
        for (let r = 0; r < ripplesRef.current.length; r++) {
          const rip = ripplesRef.current[r];
          const rx = p.x - rip.x;
          const ry = p.y - rip.y;
          const rDist = Math.hypot(rx, ry);
          const diff = Math.abs(rDist - rip.radius);
          if (diff < 36) {
            const waveIntensity = (1 - diff / 36) * (rip.strength / 20);
            const rAngle = Math.atan2(ry, rx);
            p.vx += Math.cos(rAngle) * waveIntensity * 7;
            p.vy += Math.sin(rAngle) * waveIntensity * 7;
            currentRadius = Math.max(0.4, currentRadius + waveIntensity * 2.2);
          }
        }

        // 3. Spring physics: pull back to origin
        const homeDx = p.originX - p.x;
        const homeDy = p.originY - p.y;
        p.vx += homeDx * spring;
        p.vy += homeDy * spring;
        p.vx *= friction;
        p.vy *= friction;
        p.x += p.vx;
        p.y += p.vy;

        // 4. Render either as Halftone Dot or ASCII character
        if (isAscii) {
          const charIndex = Math.min(
            ASCII_RAMP.length - 1,
            Math.floor(p.density * (ASCII_RAMP.length - 1))
          );
          ctx.fillStyle = dist < mouseRadius ? activeDotColor : primaryDotColor;
          ctx.fillText(ASCII_RAMP[charIndex], p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
          ctx.fillStyle = dist < mouseRadius ? activeDotColor : primaryDotColor;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchstart', onTouchStart);
    };
  }, [isAscii, theme, dotColor]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '560px',
        overflow: 'hidden',
        background: theme === 'light' ? '#ffffff' : 'transparent',
        cursor: 'crosshair',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

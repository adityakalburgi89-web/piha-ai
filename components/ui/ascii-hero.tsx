'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface AsciiConfig {
  renderMode: string;
  bgMode: 'original' | 'blur' | 'solid' | 'none';
  bgBlur: number;
  bgOpacity: number;
  cellSize: number;
  coverage: number;
  invert: boolean;
  styleBlend: string;
  charSet: string;
  customChars: string;
  brightness: number;
  contrast: number;
  edgeEmphasis: number;
  density: number;
  toneCurve: { x: number; y: number }[];
  tint: string;
  tintOpacity: number;
  overlayBlend: string;
  saturation: number;
  grayscale: number;
  blurType: string;
  blurAmount: number;
  blurAngle: number;
  directionalBothSides: boolean;
  tiltFocus: number;
  tiltPosition: number;
  tiltFeather: number;
  lensFocus: number;
  blurCenterX: number;
  blurCenterY: number;
  progressivePosition: number;
  progressiveReverse: boolean;
  pfx: {
    vignette: { enabled: boolean; intensity: number };
    scanLines: { enabled: boolean; intensity: number };
    chromatic: { enabled: boolean; intensity: number };
    bloom: { enabled: boolean; intensity: number };
    filmGrain: { enabled: boolean; intensity: number };
    glitch: { enabled: boolean; intensity: number };
    pixelate: { enabled: boolean; intensity: number };
    halftone: { enabled: boolean; intensity: number };
    filmDust: { enabled: boolean; intensity: number };
  };
  animated: boolean;
  animStyle: 'wave' | 'pulse' | 'shimmer' | 'ripple' | 'flicker';
  animSpeed: { enabled: boolean; intensity: number };
  animIntensity: { enabled: boolean; intensity: number };
  lights: {
    enabled: boolean;
    points: { x: number; y: number; radius: number; intensity: number }[];
  };
  mask: {
    enabled: boolean;
    tool: string;
    brushSize: number;
    showOverlay: boolean;
    invert: boolean;
    dataUrl: string | null;
    shapes: any[];
  };
}

export const DEFAULT_ASCII_CONFIG: AsciiConfig = {
  renderMode: 'characters',
  bgMode: 'original',
  bgBlur: 12,
  bgOpacity: 30,
  cellSize: 9,
  coverage: 37,
  invert: false,
  styleBlend: 'color-dodge',
  charSet: 'standard',
  customChars: '',
  brightness: 0,
  contrast: 158,
  edgeEmphasis: 0,
  density: 20,
  toneCurve: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ],
  tint: '#3ca6ff',
  tintOpacity: 0,
  overlayBlend: 'multiply',
  saturation: 100,
  grayscale: 0,
  blurType: 'off',
  blurAmount: 35,
  blurAngle: 0,
  directionalBothSides: false,
  tiltFocus: 35,
  tiltPosition: 50,
  tiltFeather: 15,
  lensFocus: 40,
  blurCenterX: 50,
  blurCenterY: 50,
  progressivePosition: 55,
  progressiveReverse: false,
  pfx: {
    vignette: { enabled: false, intensity: 38 },
    scanLines: { enabled: false, intensity: 40 },
    chromatic: { enabled: false, intensity: 15 },
    bloom: { enabled: false, intensity: 25 },
    filmGrain: { enabled: false, intensity: 30 },
    glitch: { enabled: false, intensity: 20 },
    pixelate: { enabled: false, intensity: 15 },
    halftone: { enabled: false, intensity: 20 },
    filmDust: { enabled: false, intensity: 20 },
  },
  animated: true,
  animStyle: 'shimmer',
  animSpeed: { enabled: true, intensity: 100 },
  animIntensity: { enabled: true, intensity: 60 },
  lights: { enabled: false, points: [] },
  mask: {
    enabled: false,
    tool: 'freehand',
    brushSize: 30,
    showOverlay: false,
    invert: false,
    dataUrl: null,
    shapes: [],
  },
};

const CHAR_SETS: Record<string, string> = {
  standard: ' .:-=+*#%@',
  dense: ' .`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  blocks: ' ░▒▓█',
  binary: '01',
  minimal: ' .:#',
  matrix: 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ 0123456789',
};

interface AsciiHeroProps {
  config?: Partial<AsciiConfig>;
  imageSrc?: string;
  className?: string;
}

export const AsciiHero: React.FC<AsciiHeroProps> = ({
  config: userConfig,
  imageSrc = '/ascii-editor/demos/gen-nature-wave.webp',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = { ...DEFAULT_ASCII_CONFIG, ...userConfig };

  const [imageLoaded, setImageLoaded] = useState(false);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate synthetic nature wave image if asset not present
  const createSyntheticWaveImage = (width: number, height: number): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Atmospheric ocean & sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#040d1a');
    skyGradient.addColorStop(0.4, '#0f2b48');
    skyGradient.addColorStop(0.7, '#1b5380');
    skyGradient.addColorStop(1, '#3ca6ff');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Dynamic wave curves
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, height * 0.5 + i * 40);
      for (let x = 0; x <= width; x += 10) {
        const y =
          height * 0.5 +
          i * 35 +
          Math.sin(x * 0.008 + i * 1.5) * 60 +
          Math.cos(x * 0.003 - i) * 40;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();

      const waveGrad = ctx.createLinearGradient(0, height * 0.4, 0, height);
      waveGrad.addColorStop(0, `rgba(60, 166, 255, ${0.4 - i * 0.06})`);
      waveGrad.addColorStop(1, `rgba(5, 20, 45, ${0.8 - i * 0.1})`);
      ctx.fillStyle = waveGrad;
      ctx.fill();
    }

    return canvas;
  };

  useEffect(() => {
    const sourceCanvas = document.createElement('canvas');
    sourceCanvasRef.current = sourceCanvas;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      sourceCanvas.width = img.width || 1200;
      sourceCanvas.height = img.height || 800;
      const ctx = sourceCanvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      setImageLoaded(true);
    };

    img.onerror = () => {
      // Fallback to synthetic nature wave graphic
      const synth = createSyntheticWaveImage(1200, 800);
      sourceCanvas.width = 1200;
      sourceCanvas.height = 800;
      const ctx = sourceCanvas.getContext('2d')!;
      ctx.drawImage(synth, 0, 0);
      setImageLoaded(true);
    };
  }, [imageSrc]);

  useEffect(() => {
    if (!imageLoaded) return;

    let animationFrameId: number;
    let startTime = performance.now();

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;

    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000;

      // Handle high-DPI sizing
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 500;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const sourceCanvas = sourceCanvasRef.current;
      if (!sourceCanvas) return;

      // 1. Draw Background Layer
      ctx.clearRect(0, 0, width, height);
      if (config.bgMode === 'original' || config.bgMode === 'blur') {
        ctx.save();
        ctx.globalAlpha = config.bgOpacity / 100;
        if (config.bgMode === 'blur' || config.bgBlur > 0) {
          ctx.filter = `blur(${config.bgBlur}px)`;
        }
        ctx.drawImage(sourceCanvas, 0, 0, width, height);
        ctx.restore();
      } else if (config.bgMode === 'solid') {
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, width, height);
      }

      // Sample source pixels into memory canvas sized to output
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = width;
      sampleCanvas.height = height;
      const sampleCtx = sampleCanvas.getContext('2d')!;
      sampleCtx.drawImage(sourceCanvas, 0, 0, width, height);

      let imgData: ImageData;
      try {
        imgData = sampleCtx.getImageData(0, 0, width, height);
      } catch (e) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const data = imgData.data;
      const cellSize = Math.max(3, config.cellSize);
      const cols = Math.floor(width / cellSize);
      const rows = Math.floor(height / cellSize);

      const chars =
        config.charSet === 'custom'
          ? config.customChars || ' .:-=+*#%@'
          : CHAR_SETS[config.charSet] || CHAR_SETS.standard;

      ctx.save();

      // Configure font for character rendering mode
      ctx.font = `bold ${cellSize * 1.1}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Animation calculations
      const speedMult = config.animSpeed.enabled ? (config.animSpeed.intensity / 50) : 1;
      const animVal = config.animated ? elapsed * speedMult : 0;
      const intensityVal = config.animIntensity.enabled ? config.animIntensity.intensity / 100 : 0.6;

      const coverageRatio = config.coverage / 100;

      // 2. Iterate through grid cells
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Coverage sampling mask check
          const cellHash = (Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1;
          if (Math.abs(cellHash) > coverageRatio) continue;

          const cx = c * cellSize + cellSize / 2;
          const cy = r * cellSize + cellSize / 2;

          const px = Math.min(width - 1, Math.max(0, Math.floor(cx)));
          const py = Math.min(height - 1, Math.max(0, Math.floor(cy)));
          const idx = (py * width + px) * 4;

          let red = data[idx];
          let green = data[idx + 1];
          let blue = data[idx + 2];

          // Color Adjustments: Brightness, Contrast, Saturation, Grayscale
          if (config.brightness !== 0) {
            red = Math.min(255, Math.max(0, red + config.brightness));
            green = Math.min(255, Math.max(0, green + config.brightness));
            blue = Math.min(255, Math.max(0, blue + config.brightness));
          }

          if (config.contrast !== 100) {
            const factor = (259 * (config.contrast + 255)) / (255 * (259 - config.contrast));
            red = Math.min(255, Math.max(0, factor * (red - 128) + 128));
            green = Math.min(255, Math.max(0, factor * (green - 128) + 128));
            blue = Math.min(255, Math.max(0, factor * (blue - 128) + 128));
          }

          let lum = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

          if (config.grayscale > 0) {
            const grayVal = lum * 255;
            const gFactor = config.grayscale / 100;
            red = red * (1 - gFactor) + grayVal * gFactor;
            green = green * (1 - gFactor) + grayVal * gFactor;
            blue = blue * (1 - gFactor) + grayVal * gFactor;
          }

          if (config.invert) {
            lum = 1 - lum;
            red = 255 - red;
            green = 255 - green;
            blue = 255 - blue;
          }

          // Calculate animation modulation offset per cell
          let animOffset = 0;
          if (config.animated) {
            switch (config.animStyle) {
              case 'shimmer':
                animOffset = Math.sin(animVal * 3 + c * 0.2 + r * 0.1) * 0.25 * intensityVal;
                break;
              case 'wave':
                animOffset = Math.sin(animVal * 2 + (c + r) * 0.15) * 0.3 * intensityVal;
                break;
              case 'pulse':
                animOffset = Math.cos(animVal * 2.5) * 0.2 * intensityVal;
                break;
              case 'ripple':
                const distFromCenter = Math.sqrt(Math.pow(c - cols / 2, 2) + Math.pow(r - rows / 2, 2));
                animOffset = Math.sin(animVal * 4 - distFromCenter * 0.3) * 0.3 * intensityVal;
                break;
              case 'flicker':
                animOffset = (Math.random() - 0.5) * 0.35 * intensityVal;
                break;
            }
          }

          const finalLum = Math.min(1, Math.max(0, lum + animOffset));

          // Style blend operation setup
          if (config.styleBlend && config.styleBlend !== 'normal') {
            ctx.globalCompositeOperation = config.styleBlend as GlobalCompositeOperation;
          } else {
            ctx.globalCompositeOperation = 'source-over';
          }

          ctx.fillStyle = `rgb(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)})`;

          // 3. Render Mode Switcher
          switch (config.renderMode) {
            case 'characters': {
              const charIndex = Math.min(
                chars.length - 1,
                Math.floor(finalLum * chars.length)
              );
              const glyph = chars[charIndex] || chars[0];
              ctx.fillText(glyph, cx, cy);
              break;
            }
            case 'dots': {
              const dotRadius = (cellSize / 2) * finalLum * 0.9;
              ctx.beginPath();
              ctx.arc(cx, cy, Math.max(1, dotRadius), 0, Math.PI * 2);
              ctx.fill();
              break;
            }
            case 'matrix': {
              // Self-animating matrix streams
              const matrixChars = CHAR_SETS.matrix;
              const streamHead = (Math.floor(animVal * 12 + c * 3) % rows) === r;
              const mIndex = Math.floor(Math.random() * matrixChars.length);
              ctx.fillStyle = streamHead ? '#ffffff' : `rgb(34, ${Math.round(150 + finalLum * 105)}, 85)`;
              ctx.fillText(matrixChars[mIndex], cx, cy);
              break;
            }
            case 'hexdump': {
              const hexVal = Math.floor(finalLum * 15).toString(16).toUpperCase();
              ctx.fillText(hexVal, cx, cy);
              break;
            }
            case 'cross': {
              const arm = (cellSize / 2) * finalLum;
              ctx.lineWidth = 1.5;
              ctx.strokeStyle = ctx.fillStyle;
              ctx.beginPath();
              ctx.moveTo(cx - arm, cy);
              ctx.lineTo(cx + arm, cy);
              ctx.moveTo(cx, cy - arm);
              ctx.lineTo(cx, cy + arm);
              ctx.stroke();
              break;
            }
            case 'diamond': {
              const dSize = (cellSize / 2) * finalLum;
              ctx.beginPath();
              ctx.moveTo(cx, cy - dSize);
              ctx.lineTo(cx + dSize, cy);
              ctx.lineTo(cx, cy + dSize);
              ctx.lineTo(cx - dSize, cy);
              ctx.closePath();
              ctx.fill();
              break;
            }
            default: {
              // Default to character glyphs
              const charIndex = Math.min(
                chars.length - 1,
                Math.floor(finalLum * chars.length)
              );
              ctx.fillText(chars[charIndex] || chars[0], cx, cy);
              break;
            }
          }
        }
      }

      ctx.restore();

      // 4. Layer Post-Effects (pfx)
      if (config.pfx.scanLines?.enabled) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${config.pfx.scanLines.intensity / 200})`;
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 2);
        }
        ctx.restore();
      }

      if (config.pfx.vignette?.enabled) {
        ctx.save();
        const vigGrad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.3,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.7
        );
        vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vigGrad.addColorStop(1, `rgba(0, 0, 0, ${config.pfx.vignette.intensity / 100})`);
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      if (config.pfx.filmGrain?.enabled) {
        ctx.save();
        const grainIntensity = config.pfx.filmGrain.intensity / 100;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let g = 0; g < width * height * 0.005 * grainIntensity; g++) {
          const gx = Math.random() * width;
          const gy = Math.random() * height;
          ctx.fillRect(gx, gy, 1.5, 1.5);
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [imageLoaded, config]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[500px] bg-black overflow-hidden rounded-xl border border-neutral-800 ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

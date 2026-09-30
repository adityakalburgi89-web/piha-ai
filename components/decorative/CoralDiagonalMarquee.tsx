import React from 'react';

export const CoralDiagonalMarquee: React.FC = () => {
  const items = Array.from({ length: 8 });

  return (
    <div className="diagonal-marquee-wrapper" aria-hidden="true">
      <div className="diagonal-marquee-track">
        {items.map((_, i) => (
          <div className="diagonal-item" key={i}>
            <span>NEW</span>
            <span className="diagonal-separator">/</span>
            <span>NATURAL VOICE CALLS</span>
            <span className="diagonal-separator">/</span>
            <span>INSTANT WHATSAPP DETAILS</span>
            <span className="diagonal-separator">/</span>
            <span>ENGLISH · HINDI · KANNADA · TELUGU</span>
            <span className="diagonal-separator">/</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3D perspective transform parameters configured

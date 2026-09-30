import React from 'react';

const partners = [
  { name: 'Khatabook', symbol: 'KB' },
  { name: 'Nykaa', symbol: 'NY' },
  { name: 'Razorpay', symbol: 'RZ' },
  { name: 'Shiprocket', symbol: 'SR' },
  { name: 'Zepto', symbol: 'ZP' },
  { name: 'Urban Company', symbol: 'UC' },
];

export const LogoMarqueeStrip: React.FC = () => {
  return (
    <section className="logo-marquee-section" id="partners">
      <div className="logo-marquee-label">Trusted by fast-moving D2C brands & retail teams</div>
      <div className="logo-marquee-grid">
        {partners.map((p, idx) => (
          <div className="marquee-logo-text" key={idx}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '4px',
                background: 'var(--color-soft-mist)',
                border: '1px solid #e5e5e5',
                color: 'var(--color-ink)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '-0.025em',
              }}
            >
              {p.symbol}
            </span>
            <span style={{ color: 'var(--color-ash)', fontWeight: 500 }}>{p.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

// Seamless linear gradient edge masks for ticker

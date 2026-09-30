import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        background: '#ffffff',
        color: '#0f172a',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '56px', fontWeight: 800, margin: '0 0 8px', color: '#ff6b55' }}>404</h1>
      <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 12px', color: '#1e293b' }}>Page Not Found</h2>
      <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '400px', margin: '0 0 24px', lineHeight: 1.5 }}>
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="btn-coral"
        style={{
          textDecoration: 'none',
          padding: '10px 22px',
          fontSize: '14px',
          borderRadius: '6px',
        }}
      >
        Return Home
      </Link>
    </div>
  );
}

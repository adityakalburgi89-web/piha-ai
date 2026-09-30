'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaApple } from 'react-icons/fa';

function PopupContent() {
  const searchParams = useSearchParams();
  const provider = (searchParams.get('provider') as 'google' | 'apple') || 'google';
  const isGoogle = provider === 'google';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If real Google/Apple credentials are set in .env, redirect directly to the provider
  useEffect(() => {
    async function checkRealOAuth() {
      try {
        const checkRes = await fetch('/api/auth/providers');
        if (!checkRes.ok) return;
        const available = await checkRes.json();
        if (!available[provider]) return; // Keys not configured, stay in mock dev login

        const res = await fetch('/api/auth/sign-in/social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, callbackURL: '/dashboard' }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.url) {
            window.location.href = data.url;
            return;
          }
        }
      } catch {
        // Keep dev mock popup mode
      }
    }
    checkRealOAuth();
  }, [provider]);

  const mockUser = {
    name: isGoogle ? 'Aditya Kalburgi' : 'Aditya Kalburgi (Apple ID)',
    email: isGoogle ? 'aditya.kalburgi@gmail.com' : 'aditya.apple@piha.ai',
    avatarLetter: 'A',
  };

  const handleConfirmSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/dev-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, callbackURL: '/dashboard' }),
      });

      const data = await res.json();
      if (data.success) {
        if (window.opener) {
          window.opener.postMessage(
            {
              type: 'BETTER_AUTH_POPUP_SUCCESS',
              provider,
              user: data.user,
              redirectUrl: data.url || '/dashboard',
            },
            window.location.origin
          );
          window.close();
        } else {
          window.location.href = data.url || '/dashboard';
        }
      } else {
        setError(data.error || 'Failed to authenticate');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Brand Icon Header */}
        <div style={styles.header}>
          {isGoogle ? (
            <svg width="40" height="40" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          ) : (
            <FaApple size={40} color="#111" />
          )}
        </div>

        <h2 style={styles.title}>
          Sign in with {isGoogle ? 'Google' : 'Apple'}
        </h2>
        <p style={styles.subtitle}>
          to continue to <strong style={{ color: '#111' }}>Piha AI</strong>
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Account Selector Card */}
        <button
          type="button"
          onClick={handleConfirmSignIn}
          disabled={loading}
          style={styles.accountCard}
        >
          <div style={styles.avatar}>
            {mockUser.avatarLetter}
          </div>
          <div style={styles.accountText}>
            <div style={styles.accountName}>{mockUser.name}</div>
            <div style={styles.accountEmail}>{mockUser.email}</div>
          </div>
        </button>

        <p style={styles.consentNotice}>
          To continue, {isGoogle ? 'Google' : 'Apple'} will share your name, email address, and profile picture with Piha AI.
        </p>

        <div style={styles.buttonRow}>
          <button
            type="button"
            onClick={() => window.close()}
            style={styles.cancelBtn}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmSignIn}
            style={styles.continueBtn}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OAuthPopupPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>}>
      <PopupContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#ffffff',
    borderRadius: 16,
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
    padding: '32px 28px',
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    margin: '0 0 24px 0',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'left',
  },
  accountCard: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '12px 14px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    marginBottom: 20,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: '#3b82f6',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 16,
    flexShrink: 0,
  },
  accountText: {
    flex: 1,
    overflow: 'hidden',
  },
  accountName: {
    fontSize: 14,
    fontWeight: 500,
    color: '#111827',
  },
  accountEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  consentNotice: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 1.5,
    margin: '0 0 24px 0',
    textAlign: 'left',
  },
  buttonRow: {
    display: 'flex',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '10px 18px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#374151',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  continueBtn: {
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    background: '#111827',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
};

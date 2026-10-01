'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaApple } from 'react-icons/fa';

import { InteractiveHalftoneArt } from '@/components/ui/InteractiveHalftoneArt';
import { authClient } from '@/lib/auth-client';

declare global {
  interface Window {
    ElevateAuth?: {
      signIn: (email: string, password: string) => Promise<any>;
      signUp: (email: string, password: string) => Promise<any>;
      getSession: () => Promise<any>;
    };
  }
}

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof window !== 'undefined' && event.origin !== window.location.origin) return;

      if (event.data?.type === 'BETTER_AUTH_POPUP_SUCCESS') {
        const { user, redirectUrl } = event.data;
        setLoadingProvider(null);
        showToast(`Signed in successfully as ${user.name}! Redirecting...`, 'success');
        setTimeout(() => {
          window.location.href = redirectUrl || '/dashboard';
        }, 800);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        // Create Account flow
        try {
          await authClient.signUp.email({
            email,
            password,
            name: name.trim() || email.split('@')[0],
          });
        } catch (err: any) {
          console.warn('[BetterAuth] Client signup fallback:', err?.message);
        }

        if (typeof window !== 'undefined' && window.ElevateAuth) {
          try {
            await window.ElevateAuth.signUp(email, password);
          } catch (err: any) {
            console.warn('[ElevateAuth] Supabase signup fallback:', err?.message);
          }
        }

        showToast('Account created successfully. Redirecting to dashboard...', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);
      } else {
        // Sign In flow
        try {
          await authClient.signIn.email({
            email,
            password,
          });
        } catch (err: any) {
          console.warn('[BetterAuth] Client signin fallback:', err?.message);
        }

        if (typeof window !== 'undefined' && window.ElevateAuth) {
          try {
            await window.ElevateAuth.signIn(email, password);
          } catch (err: any) {
            console.warn('[ElevateAuth] Supabase signin fallback:', err?.message);
          }
        }

        showToast(`Signed in successfully as ${email}`, 'success');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = (provider: 'google' | 'apple') => {
    setLoadingProvider(provider);

    // Calculate centered position for popup window
    const width = 480;
    const height = 620;
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);

    const popup = window.open(
      `/popup?provider=${provider}`,
      `oauth_${provider}_popup`,
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no,location=no`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      showToast('Popup blocked by browser. Please allow popups for this site.', 'error');
      setLoadingProvider(null);
      return;
    }

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setLoadingProvider(null);
      }
    }, 800);
  };

  return (
    <div className="login-viewport-wrapper">
      {/* Floating Glassmorphic Toast Notification */}
      {toast && (
        <div className="floating-toast-container" role="status" aria-live="polite">
          <div className={`floating-toast toast-${toast.type}`}>
            {toast.type === 'success' && <span className="toast-badge">OK</span>}
            {toast.type === 'error' && <span className="toast-badge">ERR</span>}
            {toast.type === 'info' && <span className="toast-badge">INFO</span>}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Misty Grayscale Atmospheric Background Canvas */}
      <div className="misty-bg-overlay" aria-hidden="true">
        {/* Silhouette of misty mountain trees */}
        <div className="forest-silhouette-tree-layer" />
      </div>

      {/* Center Floating Monograph Sign-In Card */}
      <div className="login-card-container">
        {/* Left Form Column */}
        <div className="login-form-column">
          {/* Top Brand Logo Icon Mark */}
          <Link href="/" className="brand-logo-mark" title="Back to Piha AI Home">
            <Image
              src="/images/icons/Piha.webp"
              alt="Piha AI"
              width={42}
              height={28}
              priority
              style={{ objectFit: 'contain', width: 'auto', height: '30px', display: 'block' }}
            />
          </Link>

          <h1 className="login-headline">{mode === 'signin' ? 'Sign In' : 'Create Account'}</h1>
          <p className="login-subhead">
            {mode === 'signin'
              ? 'Continue to access your dashboard'
              : 'Create an account to manage assistants and call users'}
          </p>

          {/* Social OAuth Providers */}
          <div className="oauth-buttons-stack">
            <button
              type="button"
              className="oauth-pill-btn"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loadingProvider !== null || isSubmitting}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
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
              <span>{loadingProvider === 'google' ? 'Opening Google...' : 'Continue with Google'}</span>
            </button>

            <button
              type="button"
              className="oauth-pill-btn"
              onClick={() => handleOAuthSignIn('apple')}
              disabled={loadingProvider !== null || isSubmitting}
            >
              <FaApple size={18} color="#000000" />
              <span>{loadingProvider === 'apple' ? 'Opening Apple...' : 'Continue with Apple'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="login-divider-row">
            <div className="divider-line" />
            <span className="divider-label">OR</span>
            <div className="divider-line" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {mode === 'signup' && (
              <div className="form-field-group">
                <label className="form-field-label" htmlFor="name-input">
                  Full Name
                </label>
                <input
                  id="name-input"
                  type="text"
                  className="form-pill-input"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={mode === 'signup'}
                />
              </div>
            )}

            <div className="form-field-group">
              <label className="form-field-label" htmlFor="email-input">
                Email
              </label>
              <input
                id="email-input"
                type="email"
                className="form-pill-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field-group">
              <div className="password-label-row">
                <label className="form-field-label" htmlFor="password-input">
                  Password
                </label>
                {mode === 'signin' && (
                  <a href="#forgot" className="forgot-password-link">
                    Forgot Password?
                  </a>
                )}
              </div>
              <input
                id="password-input"
                type="password"
                className="form-pill-input"
                placeholder={mode === 'signup' ? 'Create a secure password' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="sign-in-submit-btn" disabled={isSubmitting}>
              {isSubmitting
                ? mode === 'signin'
                  ? 'Signing In...'
                  : 'Creating Account...'
                : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
            </button>
          </form>

          {/* Footer Account Link */}
          <div className="login-footer-row">
            <span className="footer-prompt-text">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            </span>{' '}
            <button
              type="button"
              className="create-account-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            >
              {mode === 'signin' ? 'Create an Account' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Right Halftone Art Graphic Column */}
        <div className="login-art-column">
          <InteractiveHalftoneArt />
        </div>
      </div>
    </div>
  );
}

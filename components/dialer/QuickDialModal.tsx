'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiPhoneCall, FiArrowRight, FiUserCheck, FiChevronDown } from 'react-icons/fi';
import { AgentConfig, AGENT_PRESETS } from '@/lib/core/types/agent';

interface QuickDialModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAgentId?: string;
}

export const QuickDialModal: React.FC<QuickDialModalProps> = ({
  isOpen,
  onClose,
  selectedAgentId: initialAgentId,
}) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [agents, setAgents] = useState<AgentConfig[]>(AGENT_PRESETS);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    initialAgentId || 'agent-outbound-sales'
  );

  useEffect(() => {
    if (initialAgentId) {
      setSelectedAgentId(initialAgentId);
    }
  }, [initialAgentId]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/agents')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.agents)) {
            setAgents(data.agents);
          }
        })
        .catch(() => {
          // Fall back gracefully to AGENT_PRESETS
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentAgent =
    agents.find((a) => a.id === selectedAgentId) ||
    agents.find((a) => a.id === 'agent-outbound-sales') ||
    agents[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    window.dispatchEvent(
      new CustomEvent('elevatevoice:orb-state', { detail: { state: 'connecting', volume: 0.4 } })
    );

    try {
      const res = await fetch('/api/calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          agentId: selectedAgentId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({
          success: true,
          message: `Call placed successfully! Please answer your phone to talk with ${currentAgent.personaName} (${currentAgent.name}).`,
        });
        window.dispatchEvent(
          new CustomEvent('elevatevoice:orb-state', { detail: { state: 'speaking', volume: 0.85 } })
        );
      } else {
        setResult({
          success: false,
          message: data.error?.message || 'Could not place outbound call.',
        });
        window.dispatchEvent(
          new CustomEvent('elevatevoice:orb-state', { detail: { state: 'idle', volume: 0 } })
        );
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: 'Network error placing the call. Please try again.',
      });
      window.dispatchEvent(
        new CustomEvent('elevatevoice:orb-state', { detail: { state: 'idle', volume: 0 } })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop active" role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: '440px', width: '100%' }}>
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
          type="button"
        >
          <FiX size={18} />
        </button>

        <h3 className="modal-title">Start a Live Demo Call</h3>
        <p className="modal-subhead">
          Choose a voice assistant and enter your phone number to receive a real-time call.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Agent Selector Dropdown */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" htmlFor="quickdial-agent">
              Select Voice Assistant
            </label>
            <div style={{ position: 'relative' }}>
              <select
                id="quickdial-agent"
                className="form-input"
                style={{
                  appearance: 'none',
                  paddingRight: '32px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '13.5px',
                }}
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
              >
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.personaName} — {ag.name} ({ag.domain.replace('_', ' ').toUpperCase()})
                  </option>
                ))}
              </select>
              <FiChevronDown
                size={16}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--color-slate-400)',
                }}
              />
            </div>
          </div>

          {/* Active Agent Preview Pill */}
          {currentAgent && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '10px 12px',
                background: 'rgba(255, 107, 85, 0.06)',
                border: '1px solid rgba(255, 107, 85, 0.18)',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '12px',
                color: 'var(--color-slate-600)',
              }}
            >
              <FiUserCheck size={16} style={{ color: 'var(--color-coral)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--color-slate-900)' }}>
                  {currentAgent.personaName}
                </strong>
                <span style={{ color: 'var(--color-slate-500)', marginLeft: '6px' }}>
                  ({currentAgent.voiceName})
                </span>
                <p style={{ margin: '3px 0 0', fontStyle: 'italic', color: 'var(--color-slate-500)', lineHeight: '1.35' }}>
                  &ldquo;{currentAgent.greeting.slice(0, 95)}...&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Phone Input */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" htmlFor="quickdial-phone">
              Your Phone Number (with country code)
            </label>
            <input
              type="tel"
              id="quickdial-phone"
              className="form-input"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-coral"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            disabled={loading}
          >
            <FiPhoneCall size={16} />
            <span>{loading ? 'Calling your phone...' : `Call My Phone with ${currentAgent.personaName}`}</span>
            {!loading && <FiArrowRight size={16} />}
          </button>
        </form>

        {result && (
          <div
            style={{
              marginTop: '16px',
              fontSize: '13px',
              padding: '12px',
              borderRadius: '4px',
              background: result.success ? 'var(--color-mint-whisper)' : '#fef2f2',
              border: `1px solid ${result.success ? '#d1fae5' : '#fecaca'}`,
              color: result.success ? '#065f46' : '#991b1b',
            }}
          >
            <strong>{result.success ? 'Call Connected' : 'Notice'}</strong>
            <p style={{ margin: '4px 0 0' }}>{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

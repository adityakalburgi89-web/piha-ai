'use client';

import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiPhone,
  FiTrash2,
  FiCpu,
  FiVolume2,
  FiGlobe,
  FiCheckCircle,
  FiMessageSquare,
  FiX,
} from 'react-icons/fi';
import { AgentConfig, AgentDomain, AGENT_PRESETS } from '@/lib/core/types/agent';

interface AgentsStudioTabProps {
  onTestCall: (agentId: string) => void;
}

export const AgentsStudioTab: React.FC<AgentsStudioTabProps> = ({ onTestCall }) => {
  const [agents, setAgents] = useState<AgentConfig[]>(AGENT_PRESETS);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // New Agent Form State
  const [selectedTemplate, setSelectedTemplate] = useState<AgentDomain>('real_estate');
  const [agentName, setAgentName] = useState('Metro Realty Qualifier');
  const [personaName, setPersonaName] = useState('Rahul');
  const [voiceProvider, setVoiceProvider] = useState<'cartesia' | 'sarvam'>('cartesia');
  const [greeting, setGreeting] = useState(
    'Namaste! This is Rahul from Metro Realty. Are you looking to buy a 2BHK or 3BHK home?'
  );
  const [systemPrompt, setSystemPrompt] = useState(
    'You are Rahul, a real estate buyer qualifier. Discover location, configuration, budget, and timeline. Offer a site visit.'
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadAgents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/agents');
      const data = await res.json();
      if (data.success && Array.isArray(data.agents)) {
        setAgents(data.agents);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleTemplateChange = (domain: AgentDomain) => {
    setSelectedTemplate(domain);
    if (domain === 'real_estate') {
      setAgentName('Metro Realty Qualifier');
      setPersonaName('Rahul');
      setVoiceProvider('cartesia');
      setGreeting('Namaste! This is Rahul from Metro Realty. Are you looking to buy a 2BHK or 3BHK home?');
      setSystemPrompt('You are Rahul, a real estate buyer qualifier. Discover location, configuration, budget, and timeline. Offer a site visit.');
    } else if (domain === 'loan_recovery') {
      setAgentName('FinCare EMI Recovery Specialist');
      setPersonaName('Priya');
      setVoiceProvider('sarvam');
      setGreeting('Hello, am I speaking with the account holder? This is Priya from FinCare regarding your EMI.');
      setSystemPrompt('You are Priya, an empathetic loan recovery agent. Inquire politely about delay, offer settlement options, and send UPI link.');
    } else if (domain === 'ecommerce') {
      setAgentName('Piha AI Store Consultant');
      setPersonaName('Neha');
      setVoiceProvider('cartesia');
      setGreeting('Hey! This is Neha from Piha AI. We build custom online stores. Got two quick minutes?');
      setSystemPrompt('You are Neha, an online store consultant. Understand products, timeline, and features needed. Offer to send catalog on WhatsApp.');
    } else {
      setAgentName('Custom Outbound Agent');
      setPersonaName('Alex');
      setVoiceProvider('cartesia');
      setGreeting('Hello! Thanks for picking up. How can I assist you today?');
      setSystemPrompt('You are a professional voice AI assistant. Answer questions clearly and helpfully.');
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName,
          domain: selectedTemplate,
          personaName,
          voiceProvider,
          voiceName: voiceProvider === 'sarvam' ? 'Anushka (Sarvam Bulbul)' : 'Ramya (Cartesia Sonic)',
          greeting,
          systemPrompt,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Agent "${agentName}" created and deployed successfully!`);
        setIsModalOpen(false);
        loadAgents();
      } else {
        showToast(data.error?.message || 'Could not create agent.');
      }
    } catch {
      showToast('Error saving agent.');
    }
  };

  const handleDeleteAgent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast(`Deleted agent: ${name}`);
        loadAgents();
      } else {
        showToast(data.error?.message || 'Could not delete agent.');
      }
    } catch {
      showToast('Failed to delete agent.');
    }
  };

  const getDomainColor = (domain: AgentDomain) => {
    switch (domain) {
      case 'real_estate':
        return { bg: '#e0f2fe', border: '#bae6fd', text: '#0369a1', label: 'Real Estate' };
      case 'loan_recovery':
        return { bg: '#fef3c7', border: '#fde68a', text: '#b45309', label: 'Loan Payment' };
      case 'ecommerce':
        return { bg: '#ede9fe', border: '#ddd6fe', text: '#6d28d9', label: 'E-Commerce' };
      default:
        return { bg: '#f3e8ff', border: '#e9d5ff', text: '#7e22ce', label: 'Custom Domain' };
    }
  };

  return (
    <div className="agent-studio-wrapper" style={{ padding: '4px 0 24px' }}>
      {toast && <div className="dash-toast-banner">{toast}</div>}

      {/* Top Banner with Action Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--color-slate-200)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-slate-900)', margin: '0 0 4px' }}>
            AI Voice Assistants
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--color-slate-500)', margin: 0 }}>
            Create and manage voice assistants for Real Estate, Loan Payment Reminders, Sales, or Custom calls.
          </p>
        </div>

        <button
          type="button"
          className="btn-coral"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '13.5px' }}
        >
          <FiPlus size={16} />
          <span>Create New Assistant</span>
        </button>
      </div>

      {/* Agents Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
        }}
      >
        {agents.map((ag) => {
          const domainStyle = getDomainColor(ag.domain);
          return (
            <div
              key={ag.id}
              className="bento-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--color-slate-200)',
                background: '#ffffff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                position: 'relative',
              }}
            >
              <div>
                {/* Header row: Domain pill & preset badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: domainStyle.bg,
                      border: `1px solid ${domainStyle.border}`,
                      color: domainStyle.text,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {domainStyle.label}
                  </span>

                  {ag.isPreset ? (
                    <span style={{ fontSize: '11px', color: 'var(--color-slate-400)', fontWeight: 500 }}>
                      Ready to Use
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDeleteAgent(ag.id, ag.name)}
                      title="Delete Assistant"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-slate-400)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <FiTrash2 size={15} />
                    </button>
                  )}
                </div>

                {/* Agent Name & Persona */}
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-slate-900)', margin: '0 0 4px' }}>
                  {ag.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--color-slate-600)', marginBottom: '14px' }}>
                  <span>
                    Speaking As: <strong>{ag.personaName}</strong>
                  </span>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <FiVolume2 size={13} style={{ color: 'var(--color-coral)' }} />
                    {ag.voiceName}
                  </span>
                </div>

                {/* First Greeting Block */}
                <div
                  style={{
                    background: 'var(--color-slate-50)',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    color: 'var(--color-slate-700)',
                    lineHeight: '1.45',
                    marginBottom: '14px',
                    borderLeft: '3px solid var(--color-coral)',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase', marginBottom: '3px' }}>
                    Opening Greeting
                  </div>
                  &ldquo;{ag.greeting}&rdquo;
                </div>

                {/* Dispositions supported */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Possible Call Outcomes
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {ag.dispositionOptions.map((disp, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '11.5px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: 'var(--color-slate-100)',
                          color: 'var(--color-slate-700)',
                        }}
                      >
                        {disp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Test Call Button */}
              <button
                type="button"
                className="btn-coral"
                onClick={() => onTestCall(ag.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px',
                  fontSize: '13px',
                }}
              >
                <FiPhone size={14} />
                <span>Make a Test Call with {ag.personaName}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Create New Agent Modal */}
      {isModalOpen && (
        <div className="modal-backdrop active" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              className="modal-close-btn"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
              type="button"
            >
              <FiX size={18} />
            </button>

            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCpu style={{ color: 'var(--color-coral)' }} />
              Create Custom Voice Assistant
            </h3>
            <p className="modal-subhead">
              Choose a template or customize how your assistant speaks and answers customer questions.
            </p>

            <form onSubmit={handleCreateAgent}>
              {/* Template Picker */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Select Industry / Goal</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {(['real_estate', 'loan_recovery', 'ecommerce', 'custom'] as AgentDomain[]).map((dom) => (
                    <button
                      type="button"
                      key={dom}
                      onClick={() => handleTemplateChange(dom)}
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        border: `1.5px solid ${selectedTemplate === dom ? 'var(--color-coral)' : 'var(--color-slate-200)'}`,
                        background: selectedTemplate === dom ? 'rgba(255, 107, 85, 0.05)' : '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: selectedTemplate === dom ? 600 : 400,
                        color: selectedTemplate === dom ? 'var(--color-coral)' : 'var(--color-slate-700)',
                      }}
                    >
                      {dom === 'real_estate' && 'Real Estate'}
                      {dom === 'loan_recovery' && 'Loan Payment Reminder'}
                      {dom === 'ecommerce' && 'E-Commerce & Retail Sales'}
                      {dom === 'custom' && 'Custom Purpose'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent Name */}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Assistant Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Hyderabad Luxury Homes Advisor"
                  required
                />
              </div>

              {/* Persona Name & Voice Provider */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Speaking As (Name)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={personaName}
                    onChange={(e) => setPersonaName(e.target.value)}
                    placeholder="e.g. Rahul, Priya"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Voice Accent</label>
                  <select
                    className="form-input"
                    value={voiceProvider}
                    onChange={(e) => setVoiceProvider(e.target.value as any)}
                  >
                    <option value="cartesia">Fast & Natural Accent</option>
                    <option value="sarvam">Indian Accent & Regional Languages</option>
                  </select>
                </div>
              </div>

              {/* First Greeting */}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Opening Greeting</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  placeholder="What the assistant says when the customer answers the phone"
                  required
                />
              </div>

              {/* System Prompt */}
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label">Assistant Instructions & Goals</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Describe what questions the assistant should ask, how to handle customer objections, and what details to gather."
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-coral"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <FiCheckCircle size={16} />
                <span>Save & Activate Assistant</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

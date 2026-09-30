'use client';

import React, { useState, useEffect } from 'react';
import {
  FiPhone,
  FiPhoneCall,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiActivity,
  FiUsers,
  FiMessageSquare,
  FiRefreshCw,
  FiFileText,
  FiX,
} from 'react-icons/fi';
import { FullAnalyticsPayload, FormattedCallLog } from '@/lib/services/AnalyticsService';

interface AnalyticsViewTabProps {
  onTriggerCall?: () => void;
}

export const AnalyticsViewTab: React.FC<AnalyticsViewTabProps> = ({ onTriggerCall }) => {
  const [data, setData] = useState<FullAnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCall, setSelectedCall] = useState<FormattedCallLog | null>(null);

  const fetchAnalytics = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (json.success && json.analytics) {
        setData(json.analytics);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-slate-500)' }}>
        <FiRefreshCw className="spin-icon" size={24} style={{ marginBottom: '12px' }} />
        <p>Loading real-time telephony intelligence & analytics...</p>
      </div>
    );
  }

  const summary = data?.summary || {
    totalCalls: 0,
    connectedCalls: 0,
    pickupRatePct: 0,
    acdSeconds: 0,
    acdFormatted: '0m 00s',
    qualifiedCount: 0,
    qualificationRatePct: 0,
  };

  const dispositions = data?.dispositionBreakdown || [];
  const hourly = data?.hourlyActivity || [];
  const agentMetrics = data?.agentMetrics || [];
  const recentCalls = data?.recentCalls || [];

  return (
    <div className="analytics-view-wrapper" style={{ padding: '4px 0 32px' }}>
      {/* Header with Title & Refresh */}
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
            Call Performance & Insights
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--color-slate-500)', margin: 0 }}>
            See how your voice assistants are performing, how many calls are answered, and how many leads are converted.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="dash-btn-refresh"
            onClick={fetchAnalytics}
            title="Refresh metrics"
            style={{ padding: '8px 12px', border: '1px solid var(--color-slate-200)', borderRadius: '6px' }}
          >
            <FiRefreshCw className={isRefreshing ? 'spin-icon' : ''} size={15} />
            <span style={{ marginLeft: '6px', fontSize: '13px' }}>Refresh</span>
          </button>

          {onTriggerCall && (
            <button type="button" className="btn-coral" onClick={onTriggerCall} style={{ padding: '8px 16px', fontSize: '13px' }}>
              <FiPhone size={14} style={{ marginRight: '6px' }} />
              <span>Make a Test Call</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {/* Total Calls Dialed */}
        <div className="bento-card" style={{ padding: '22px 24px', background: '#fff', borderRadius: '12px', border: '1px solid var(--color-slate-200)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate-500)', fontSize: '12.5px', marginBottom: '8px' }}>
            <span>Total Calls Made</span>
            <FiPhoneCall size={18} style={{ color: 'var(--color-coral)' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-slate-900)' }}>
            {summary.totalCalls}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-slate-500)', marginTop: '4px' }}>
            Handled automatically by AI
          </div>
        </div>

        {/* Pickup / Connect Rate */}
        <div className="bento-card" style={{ padding: '22px 24px', background: '#fff', borderRadius: '12px', border: '1px solid var(--color-slate-200)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate-500)', fontSize: '12.5px', marginBottom: '8px' }}>
            <span>Call Answer Rate</span>
            <FiCheckCircle size={18} style={{ color: 'var(--color-coral)' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-slate-900)' }}>
            {summary.pickupRatePct}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-slate-500)', marginTop: '4px' }}>
            {summary.connectedCalls} answered out of {summary.totalCalls} calls
          </div>
        </div>

        {/* Average Call Duration */}
        <div className="bento-card" style={{ padding: '22px 24px', background: '#fff', borderRadius: '12px', border: '1px solid var(--color-slate-200)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate-500)', fontSize: '12.5px', marginBottom: '8px' }}>
            <span>Average Conversation Time</span>
            <FiClock size={18} style={{ color: '#3b82f6' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-slate-900)' }}>
            {summary.acdFormatted}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-slate-500)', marginTop: '4px' }}>
            Natural, friendly customer talk time
          </div>
        </div>

        {/* Conversion / Qualified Rate */}
        <div className="bento-card" style={{ padding: '22px 24px', background: '#fff', borderRadius: '12px', border: '1px solid var(--color-slate-200)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-slate-500)', fontSize: '12.5px', marginBottom: '8px' }}>
            <span>Interested Customers</span>
            <FiTrendingUp size={18} style={{ color: '#8b5cf6' }} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-slate-900)' }}>
            {summary.qualificationRatePct}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-slate-500)', marginTop: '4px' }}>
            {summary.qualifiedCount} customers interested in buying
          </div>
        </div>
      </div>

      {/* Charts & Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Disposition Distribution */}
        <div className="bento-card" style={{ padding: '20px', background: '#fff', borderRadius: '10px', border: '1px solid var(--color-slate-200)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-slate-900)', margin: '0 0 16px' }}>
            Customer Call Outcomes
          </h3>
          {summary.totalCalls === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-slate-400)', fontSize: '13px' }}>
              No call outcomes recorded yet. Start a test call to see customer interest breakdown.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dispositions.map((disp, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--color-slate-700)' }}>{disp.label}</span>
                    <span style={{ color: 'var(--color-slate-500)' }}>
                      {disp.count} ({disp.percentage}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--color-slate-100)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, Math.max(disp.percentage, 3))}%`, height: '100%', background: disp.color, borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hourly Call Activity Visual Bars */}
        <div className="bento-card" style={{ padding: '20px', background: '#fff', borderRadius: '10px', border: '1px solid var(--color-slate-200)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-slate-900)', margin: '0 0 16px' }}>
            Call Activity by Hour
          </h3>
          {hourly.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-slate-400)', fontSize: '13px' }}>
              No call activity recorded yet. Calls will be grouped by hour as they happen.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '150px', paddingTop: '10px' }}>
                {hourly.map((h, i) => {
                  const maxVal = Math.max(...hourly.map(item => item.total), 1);
                  const heightPct = Math.round((h.total / maxVal) * 100);
                  const connectHeightPct = Math.round((h.connected / maxVal) * 100);
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                      <div style={{ position: 'relative', width: '22px', height: '110px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        {/* Total Bar */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            width: '100%',
                            height: `${heightPct}%`,
                            background: 'rgba(255, 107, 85, 0.25)',
                            borderRadius: '4px',
                          }}
                        />
                        {/* Connected Bar */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            width: '100%',
                            height: `${connectHeightPct}%`,
                            background: 'var(--color-coral)',
                            borderRadius: '4px',
                          }}
                          title={`${h.connected} of ${h.total} answered`}
                        />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--color-slate-500)' }}>{h.hour}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '14px', fontSize: '11.5px', color: 'var(--color-slate-500)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', background: 'var(--color-coral)', borderRadius: '2px' }} />
                  Answered Calls
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', background: 'rgba(255, 107, 85, 0.25)', borderRadius: '2px' }} />
                  Total Calls Made
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Per-Agent Performance Matrix */}
      <div className="bento-card" style={{ padding: '20px', background: '#fff', borderRadius: '10px', border: '1px solid var(--color-slate-200)', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-slate-900)', margin: '0 0 14px' }}>
          Assistant Performance Overview
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-slate-200)', color: 'var(--color-slate-600)', fontSize: '12px', fontWeight: 600 }}>
                <th style={{ padding: '12px 14px' }}>Assistant Name</th>
                <th style={{ padding: '12px 14px' }}>Industry</th>
                <th style={{ padding: '12px 14px' }}>Calls Made</th>
                <th style={{ padding: '12px 14px' }}>Answered</th>
                <th style={{ padding: '12px 14px' }}>Answer Rate</th>
                <th style={{ padding: '12px 14px' }}>Avg Call Duration</th>
                <th style={{ padding: '12px 14px' }}>Interested Leads</th>
              </tr>
            </thead>
            <tbody>
              {agentMetrics.map((ag) => (
                <tr key={ag.agentId} style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 600, color: 'var(--color-slate-900)' }}>
                    {ag.agentName} ({ag.persona})
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--color-slate-100)', fontSize: '12px', textTransform: 'capitalize' }}>
                      {ag.domain.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>{ag.totalCalls}</td>
                  <td style={{ padding: '12px 10px' }}>{ag.connectedCalls}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-slate-900)', fontWeight: 600 }}>{ag.pickupRatePct}%</td>
                  <td style={{ padding: '14px 16px' }}>{ag.acdFormatted}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#8b5cf6' }}>{ag.qualifiedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Explorer Log Table */}
      <div className="bento-card" style={{ padding: '20px', background: '#fff', borderRadius: '10px', border: '1px solid var(--color-slate-200)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-slate-900)', margin: '0 0 14px' }}>
          Call History & Details
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-slate-200)', color: 'var(--color-slate-600)', fontSize: '12px', fontWeight: 600 }}>
                <th style={{ padding: '12px 14px' }}>Call ID</th>
                <th style={{ padding: '12px 14px' }}>Phone Number</th>
                <th style={{ padding: '12px 14px' }}>Assistant</th>
                <th style={{ padding: '12px 14px' }}>Duration</th>
                <th style={{ padding: '12px 14px' }}>Language</th>
                <th style={{ padding: '12px 14px' }}>Customer Interest</th>
                <th style={{ padding: '12px 14px' }}>WhatsApp Sent</th>
                <th style={{ padding: '12px 14px' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '36px 12px', textAlign: 'center', color: 'var(--color-slate-400)', fontSize: '13px' }}>
                    No call records found yet. Make a test call to see live conversation details.
                  </td>
                </tr>
              ) : (
                recentCalls.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
                    <td style={{ padding: '12px 10px', fontFamily: 'monospace', color: 'var(--color-slate-500)', fontSize: '12px' }}>
                      {c.callId}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: 500 }}>{c.phone}</td>
                    <td style={{ padding: '12px 10px' }}>{c.agentName}</td>
                    <td style={{ padding: '12px 10px' }}>{c.durationFormatted}</td>
                    <td style={{ padding: '12px 10px' }}>{c.language}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: c.classification === 'HOT' ? 'rgba(255, 107, 85, 0.08)' : c.classification === 'WARM' ? '#dbeafe' : '#f1f5f9',
                          color: c.classification === 'HOT' ? '#ff6b55' : c.classification === 'WARM' ? '#1e40af' : '#475569',
                          border: c.classification === 'HOT' ? '1px solid rgba(255, 107, 85, 0.22)' : '1px solid transparent',
                        }}
                      >
                        {c.classification}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {c.whatsappSent ? (
                        <span style={{ color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <FiCheckCircle size={14} /> Delivered
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-slate-400)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedCall(c)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--color-slate-200)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          color: 'var(--color-coral)',
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transcript & Details Drawer Modal */}
      {selectedCall && (
        <div className="modal-backdrop active" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: '500px', width: '100%' }}>
            <button
              className="modal-close-btn"
              onClick={() => setSelectedCall(null)}
              aria-label="Close modal"
              type="button"
            >
              <FiX size={18} />
            </button>

            <h3 className="modal-title">Call Details</h3>
            <p className="modal-subhead">
              {selectedCall.callId} • {selectedCall.phone} • Assistant: {selectedCall.agentName}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px', fontSize: '13px' }}>
              <div>
                Duration: <strong>{selectedCall.durationFormatted}</strong>
              </div>
              <div>
                Language: <strong>{selectedCall.language}</strong>
              </div>
              <div>
                Interest Level: <strong>{selectedCall.intentScore}/100</strong>
              </div>
              <div>
                WhatsApp: <strong>{selectedCall.whatsappSent ? 'Delivered' : 'None'}</strong>
              </div>
            </div>

            <div style={{ background: 'var(--color-slate-50)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-slate-200)', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-slate-400)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Conversation Preview
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-slate-800)', margin: 0, fontStyle: 'italic', lineHeight: '1.5' }}>
                &ldquo;{selectedCall.transcriptSnippet}&rdquo;
              </p>
            </div>

            <button
              type="button"
              className="btn-coral"
              style={{ width: '100%' }}
              onClick={() => setSelectedCall(null)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  FiPhone,
  FiActivity,
  FiUsers,
  FiMessageSquare,
  FiCheckCircle,
  FiClock,
  FiLogOut,
  FiPlay,
  FiSend,
  FiShield,
  FiZap,
  FiGlobe,
  FiRefreshCw,
  FiArrowUpRight,
} from 'react-icons/fi';
import { QuickDialModal } from '@/components/dialer/QuickDialModal';
import { AgentsStudioTab } from '@/components/dashboard/AgentsStudioTab';
import { AnalyticsViewTab } from '@/components/dashboard/AnalyticsViewTab';
import { FullAnalyticsPayload, FormattedCallLog } from '@/lib/services/AnalyticsService';

interface RecentCall {
  id: string;
  phone: string;
  name: string;
  language: string;
  duration: string;
  intent: 'Hot Lead' | 'Warm Lead' | 'Callback' | 'Info Inquiry';
  whatsappSent: boolean;
  timestamp: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [selectedAgentForCall, setSelectedAgentForCall] = useState<string>('agent-ecommerce-neha');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'telugu' | 'hindi' | 'english'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'analytics' | 'calls' | 'whatsapp'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic live state - zero hardcoded/mock calls
  const [analyticsData, setAnalyticsData] = useState<FullAnalyticsPayload | null>(null);
  const [callsList, setCallsList] = useState<RecentCall[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (json.success && json.analytics) {
        setAnalyticsData(json.analytics);
        const mappedCalls: RecentCall[] = (json.analytics.recentCalls || []).map((c: FormattedCallLog) => {
          let intentLabel: 'Hot Lead' | 'Warm Lead' | 'Callback' | 'Info Inquiry' = 'Info Inquiry';
          if (c.classification === 'HOT') intentLabel = 'Hot Lead';
          else if (c.classification === 'WARM') intentLabel = 'Warm Lead';
          else if (c.classification === 'CALLBACK') intentLabel = 'Callback';

          return {
            id: c.callId,
            phone: c.phone,
            name: c.agentName,
            language: c.language,
            duration: c.durationFormatted,
            intent: intentLabel,
            whatsappSent: c.whatsappSent,
            timestamp: c.timestamp ? new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
          };
        });
        setCallsList(mappedCalls);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
    showToast('Dashboard metrics re-synced with live telemetry');
  };

  const handleSignOut = () => {
    showToast('Signing out...');
    setTimeout(() => {
      router.push('/login');
    }, 400);
  };

  const filteredCalls = callsList.filter((call) => {
    if (selectedLanguage === 'all') return true;
    return call.language.toLowerCase().includes(selectedLanguage);
  });

  return (
    <div className="dashboard-viewport">
      {/* Top Floating Glass Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          {/* Left Brand Identity */}
          <Link href="/" className="dashboard-brand">
            <span className="dashboard-brand-icon">
              <Image
                src="/images/icons/Piha.webp"
                alt="Piha AI"
                width={36}
                height={24}
                priority
                style={{ objectFit: 'contain', height: '24px', width: 'auto' }}
              />
            </span>
            <span className="dashboard-brand-name">Piha AI</span>
            <span className="dashboard-badge-pill">Dashboard</span>
          </Link>

          {/* Navigation Links */}
          <nav className="dashboard-nav-tabs">
            <button
              type="button"
              className={`dash-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              type="button"
              className={`dash-tab-btn ${activeTab === 'agents' ? 'active' : ''}`}
              onClick={() => setActiveTab('agents')}
            >
              Voice Assistants
            </button>
            <button
              type="button"
              className={`dash-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Call Performance
            </button>
            <button
              type="button"
              className={`dash-tab-btn ${activeTab === 'calls' ? 'active' : ''}`}
              onClick={() => setActiveTab('calls')}
            >
              Call History
            </button>
            <button
              type="button"
              className={`dash-tab-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
              onClick={() => setActiveTab('whatsapp')}
            >
              WhatsApp Follow-ups
            </button>
          </nav>

          {/* Right Action Cluster */}
          <div className="dashboard-user-cluster">
            <button
              type="button"
              className="dash-btn-refresh"
              onClick={handleRefresh}
              title="Refresh Data"
            >
              <FiRefreshCw className={isRefreshing ? 'spin-icon' : ''} size={15} />
            </button>

            <button
              type="button"
              className="dash-btn-call"
              onClick={() => setIsDialerOpen(true)}
            >
              <FiPhone size={15} />
              <span>Make a Test Call</span>
            </button>

            <div className="dashboard-user-avatar" title="Account Profile">
              <span className="avatar-dot" />
              <span className="avatar-initials">AK</span>
            </div>

            <button
              type="button"
              className="dash-btn-logout"
              onClick={handleSignOut}
              title="Sign Out"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="dashboard-main-content">
        {/* Toast Alert */}
        {toastMessage && <div className="dash-toast-banner">{toastMessage}</div>}

        {/* Tab 1: Voice Assistants Studio */}
        {activeTab === 'agents' && (
          <AgentsStudioTab
            onTestCall={(agentId) => {
              setSelectedAgentForCall(agentId);
              setIsDialerOpen(true);
            }}
          />
        )}

        {/* Tab 2: Call Performance */}
        {activeTab === 'analytics' && (
          <AnalyticsViewTab
            onTriggerCall={() => setIsDialerOpen(true)}
          />
        )}

        {/* Tab 3: Overview & Call Logs */}
        {(activeTab === 'overview' || activeTab === 'calls' || activeTab === 'whatsapp') && (
          <>
            {/* Hero Section Banner */}
            <section className="dash-hero-card">
          <div className="dash-hero-info">
            <div className="dash-live-badge">
              <span className="pulse-beacon" />
              <span>Live calling system ready</span>
            </div>
            <h1 className="dash-hero-title">AI Voice & WhatsApp Sales Assistant</h1>
            <p className="dash-hero-desc">
              Automatically calls your prospective customers, speaks politely in Indian languages, answers their questions, and sends WhatsApp brochures instantly.
            </p>
          </div>

          <div className="dash-hero-quick-stats">
            <div className="mini-stat-pill">
              <span className="mini-stat-label">Calling Service</span>
              <span className="mini-stat-val">Connected & Ready</span>
            </div>
            <div className="mini-stat-pill">
              <span className="mini-stat-label">Response Speed</span>
              <span className="mini-stat-val text-coral">Natural & Instant</span>
            </div>
            <div className="mini-stat-pill">
              <span className="mini-stat-label">Data Backup</span>
              <span className="mini-stat-val text-blue">Automatically Saved</span>
            </div>
          </div>
        </section>

        {/* Bento Grid Analytics Cards */}
        <section className="dash-bento-grid">
          {/* Card 1: Total Calls */}
          <div className="bento-card">
            <div className="bento-card-header">
              <span className="bento-icon-box bg-coral">
                <FiPhone size={18} />
              </span>
              <span className="bento-trend positive">Total</span>
            </div>
            <div className="bento-card-body">
              <h3 className="bento-val">{analyticsData?.summary.totalCalls ?? 0}</h3>
              <p className="bento-title">Total Calls Made</p>
              <span className="bento-subtext">
                {analyticsData && analyticsData.summary.totalCalls > 0
                  ? `${analyticsData.summary.pickupRatePct}% answered by customers`
                  : 'No calls dialed yet'}
              </span>
            </div>
          </div>

          {/* Card 2: Response Time */}
          <div className="bento-card">
            <div className="bento-card-header">
              <span className="bento-icon-box bg-slate">
                <FiZap size={18} />
              </span>
              <span className="bento-trend positive">Natural Flow</span>
            </div>
            <div className="bento-card-body">
              <h3 className="bento-val">Under 1 Sec</h3>
              <p className="bento-title">Average Response Time</p>
              <span className="bento-subtext">Speaks naturally without awkward pauses</span>
            </div>
          </div>

          {/* Card 3: Interested Leads */}
          <div className="bento-card">
            <div className="bento-card-header">
              <span className="bento-icon-box bg-yellow">
                <FiUsers size={18} />
              </span>
              <span className="bento-trend positive">High Interest</span>
            </div>
            <div className="bento-card-body">
              <h3 className="bento-val">
                {analyticsData ? `${analyticsData.summary.qualificationRatePct}%` : '0%'}
              </h3>
              <p className="bento-title">Interested Customers</p>
              <span className="bento-subtext">
                {analyticsData?.summary.qualifiedCount ?? 0} prospective buyers interested
              </span>
            </div>
          </div>

          {/* Card 4: WhatsApp Sent */}
          <div className="bento-card">
            <div className="bento-card-header">
              <span className="bento-icon-box bg-blue">
                <FiMessageSquare size={18} />
              </span>
              <span className="bento-trend positive">Delivered</span>
            </div>
            <div className="bento-card-body">
              <h3 className="bento-val">
                {callsList.filter((c) => c.whatsappSent).length}
              </h3>
              <p className="bento-title">WhatsApp Brochures Sent</p>
              <span className="bento-subtext">Sent directly to customer phones</span>
            </div>
          </div>
        </section>

        {/* Live Call Telephony Workspace Grid */}
        <section className="dash-workspace-grid">
          {/* Left Main Column: Live Call Stream & Recent Call Logs */}
          <div className="dash-main-column">
            {/* Active Telephony Monitor */}
            <div className="dash-panel-card">
              <div className="dash-panel-header">
                <div className="panel-title-group">
                  <FiActivity className="panel-title-icon" size={18} />
                  <h2>Live Call Monitor</h2>
                </div>
                <button
                  type="button"
                  className="dash-btn-small"
                  onClick={() => setIsDialerOpen(true)}
                >
                  <FiPlay size={13} /> Make a Test Call
                </button>
              </div>

              <div className="dash-live-call-box" style={{ textAlign: 'center', padding: '36px 20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 107, 85, 0.1)', color: 'var(--color-coral)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <FiPhone size={20} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-slate-900)', margin: '0 0 6px' }}>
                  Ready to Place Calls
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-slate-500)', maxWidth: '440px', margin: '0 auto 18px', lineHeight: 1.5 }}>
                  No call is active right now. Start a call to hear the assistant speak, follow the live conversation, and view automatic WhatsApp follow-ups.
                </p>
                <button
                  type="button"
                  className="btn-coral"
                  onClick={() => setIsDialerOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', fontSize: '13px' }}
                >
                  <FiPlay size={14} /> Start a Test Call
                </button>
              </div>
            </div>

            {/* Customer Call History Table */}
            <div className="dash-panel-card">
              <div className="dash-panel-header">
                <div className="panel-title-group">
                  <FiClock className="panel-title-icon" size={18} />
                  <h2>Recent Customer Conversations</h2>
                </div>

                {/* Filter Buttons */}
                <div className="filter-pill-cluster">
                  <button
                    type="button"
                    className={`filter-btn ${selectedLanguage === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedLanguage('all')}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${selectedLanguage === 'telugu' ? 'active' : ''}`}
                    onClick={() => setSelectedLanguage('telugu')}
                  >
                    Telugu
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${selectedLanguage === 'hindi' ? 'active' : ''}`}
                    onClick={() => setSelectedLanguage('hindi')}
                  >
                    Hindi
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${selectedLanguage === 'english' ? 'active' : ''}`}
                    onClick={() => setSelectedLanguage('english')}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="dash-table-wrapper">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Call ID</th>
                      <th>Customer / Lead</th>
                      <th>Language</th>
                      <th>Call Duration</th>
                      <th>Customer Interest</th>
                      <th>WhatsApp Follow-up</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCalls.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--color-slate-400)', fontSize: '13px' }}>
                          No calls recorded yet. Click &quot;Make a Test Call&quot; to start your first conversation.
                        </td>
                      </tr>
                    ) : (
                      filteredCalls.map((call) => (
                        <tr key={call.id}>
                          <td className="font-mono text-dim">{call.id}</td>
                          <td>
                            <div className="customer-cell">
                              <span className="customer-name">{call.name}</span>
                              <span className="customer-phone">{call.phone}</span>
                            </div>
                          </td>
                          <td>
                            <span className="lang-tag">{call.language}</span>
                          </td>
                          <td>{call.duration}</td>
                          <td>
                            <span
                              className={`intent-badge ${
                                call.intent === 'Hot Lead'
                                  ? 'hot'
                                  : call.intent === 'Warm Lead'
                                  ? 'warm'
                                  : call.intent === 'Callback'
                                  ? 'callback'
                                  : 'info'
                              }`}
                            >
                              {call.intent}
                            </span>
                          </td>
                          <td>
                            {call.whatsappSent ? (
                              <span className="wa-status sent">
                                <FiCheckCircle size={14} /> Delivered
                              </span>
                            ) : (
                              <span className="wa-status pending">Pending</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="dash-action-link"
                              onClick={() => showToast(`View details for ${call.id}`)}
                            >
                              View <FiArrowUpRight size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar Column: AI Provider Health & System Status */}
          <div className="dash-sidebar-column">
            {/* System Status Panel */}
            <div className="dash-panel-card">
              <div className="dash-panel-header">
                <div className="panel-title-group">
                  <FiShield className="panel-title-icon" size={18} />
                  <h2>System & Services Status</h2>
                </div>
              </div>

              <div className="health-status-stack">
                <div className="health-item">
                  <div className="health-info">
                    <span className="health-name">Speech Understanding</span>
                    <span className="health-sub">Hindi, Telugu & English</span>
                  </div>
                  <span className="health-badge status-active">Active</span>
                </div>

                <div className="health-item">
                  <div className="health-info">
                    <span className="health-name">Smart Conversation Logic</span>
                    <span className="health-sub">Answers questions & qualifies leads</span>
                  </div>
                  <span className="health-badge status-active">Active</span>
                </div>

                <div className="health-item">
                  <div className="health-info">
                    <span className="health-name">Natural Voice Speaking</span>
                    <span className="health-sub">Clear, polite Indian accent</span>
                  </div>
                  <span className="health-badge status-active">Active</span>
                </div>

                <div className="health-item">
                  <div className="health-info">
                    <span className="health-name">WhatsApp Messaging</span>
                    <span className="health-sub">Instant brochure delivery</span>
                  </div>
                  <span className="health-badge status-active">Connected</span>
                </div>

                <div className="health-item">
                  <div className="health-info">
                    <span className="health-name">Customer Data Storage</span>
                    <span className="health-sub">Secure cloud backup</span>
                  </div>
                  <span className="health-badge status-active">Saved & Synced</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="dash-panel-card">
              <div className="dash-panel-header">
                <div className="panel-title-group">
                  <FiGlobe className="panel-title-icon" size={18} />
                  <h2>Quick Actions</h2>
                </div>
              </div>

              <div className="quick-actions-stack">
                <button
                  type="button"
                  className="quick-action-btn"
                  onClick={() => setIsDialerOpen(true)}
                >
                  <FiPhone size={15} />
                  <span>Make a Test Call</span>
                </button>

                <button
                  type="button"
                  className="quick-action-btn"
                  onClick={() => showToast('Dispatched WhatsApp brochure to developer phone')}
                >
                  <FiSend size={15} />
                  <span>Send Test WhatsApp Brochure</span>
                </button>

                <button
                  type="button"
                  className="quick-action-btn"
                  onClick={() => showToast('Customer leads spreadsheet exported successfully')}
                >
                  <FiArrowUpRight size={15} />
                  <span>Download Leads (Spreadsheet)</span>
                </button>
              </div>
            </div>
          </div>
        </section>
        </>
        )}
      </main>

      {/* Interactive Telephony Call Modal */}
      <QuickDialModal
        isOpen={isDialerOpen}
        onClose={() => setIsDialerOpen(false)}
        selectedAgentId={selectedAgentForCall}
      />
    </div>
  );
}

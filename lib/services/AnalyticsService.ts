import { hybridCallRepository, HybridCallRepository } from '../repositories/hybridCallRepository';
import { agentService } from './AgentService';
import { CallState } from '../core/types/callState';

export interface AnalyticsSummary {
  totalCalls: number;
  connectedCalls: number;
  pickupRatePct: number;
  acdSeconds: number;
  acdFormatted: string;
  qualifiedCount: number;
  qualificationRatePct: number;
}

export interface DispositionItem {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface HourlyActivityItem {
  hour: string;
  total: number;
  connected: number;
}

export interface AgentPerformanceMetric {
  agentId: string;
  agentName: string;
  persona: string;
  domain: string;
  totalCalls: number;
  connectedCalls: number;
  pickupRatePct: number;
  acdFormatted: string;
  qualifiedCount: number;
}

export interface FormattedCallLog {
  id: string;
  callId: string;
  agentId: string;
  agentName: string;
  phone: string;
  status: string;
  durationSeconds: number;
  durationFormatted: string;
  language: string;
  classification: string;
  intentScore: number;
  whatsappSent: boolean;
  transcriptSnippet: string;
  timestamp: string;
}

export interface FullAnalyticsPayload {
  summary: AnalyticsSummary;
  dispositionBreakdown: DispositionItem[];
  hourlyActivity: HourlyActivityItem[];
  agentMetrics: AgentPerformanceMetric[];
  recentCalls: FormattedCallLog[];
}

export class AnalyticsService {
  private repository: HybridCallRepository;

  constructor(repository?: HybridCallRepository) {
    this.repository = repository || hybridCallRepository;
  }

  public async getAnalytics(): Promise<FullAnalyticsPayload> {
    const rawCalls = await this.repository.findAll();
    const allAgents = await agentService.getAllAgents();
    const agentMap = new Map(allAgents.map((a) => [a.id, a]));

    // Only use real calls from the repository - zero fake or seeded data
    const calls = rawCalls;

    const totalCalls = calls.length;
    const connectedCalls = calls.filter(
      (c) => c.callStatus === 'connected' || c.callStatus === 'completed'
    ).length;
    const pickupRatePct = totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0;

    // Calculate Average Call Duration (ACD)
    let totalDurationSec = 0;
    let durationCount = 0;
    for (const c of calls) {
      if (c.callStatus === 'completed' || c.callStatus === 'connected') {
        const sec = c.durationSeconds || this.estimateDuration(c);
        totalDurationSec += sec;
        durationCount++;
      }
    }
    const acdSeconds = durationCount > 0 ? Math.round(totalDurationSec / durationCount) : 0;
    const acdMinutes = Math.floor(acdSeconds / 60);
    const acdRemainderSec = acdSeconds % 60;
    const acdFormatted = `${acdMinutes}m ${acdRemainderSec < 10 ? '0' : ''}${acdRemainderSec}s`;

    // Qualified count (HOT, Promise to Pay, or High Intent)
    const qualifiedCount = calls.filter(
      (c) => c.classification === 'HOT' || c.intentScore >= 75
    ).length;
    const qualificationRatePct =
      connectedCalls > 0 ? Math.round((qualifiedCount / connectedCalls) * 100) : 0;

    // Dispositions
    const dispositionCounts: Record<string, number> = {
      'Hot Lead / PTP': 0,
      'Warm Lead / Callback': 0,
      'Cold / Not Interested': 0,
      'Info Inquiry': 0,
      'Unreached / Dropped': 0,
    };

    for (const c of calls) {
      if (c.callStatus === 'failed' || c.callStatus === 'busy' || c.callStatus === 'no-answer') {
        dispositionCounts['Unreached / Dropped']++;
      } else if (c.classification === 'HOT' || c.intentScore >= 75) {
        dispositionCounts['Hot Lead / PTP']++;
      } else if (c.classification === 'WARM' || c.callback?.requested) {
        dispositionCounts['Warm Lead / Callback']++;
      } else if (c.classification === 'COLD') {
        dispositionCounts['Cold / Not Interested']++;
      } else {
        dispositionCounts['Info Inquiry']++;
      }
    }

    const dispositionBreakdown: DispositionItem[] = [
      {
        label: 'Hot Lead / PTP',
        count: dispositionCounts['Hot Lead / PTP'],
        percentage: totalCalls > 0 ? Math.round((dispositionCounts['Hot Lead / PTP'] / totalCalls) * 100) : 0,
        color: '#10b981', // green
      },
      {
        label: 'Warm Lead / Callback',
        count: dispositionCounts['Warm Lead / Callback'],
        percentage: totalCalls > 0 ? Math.round((dispositionCounts['Warm Lead / Callback'] / totalCalls) * 100) : 0,
        color: '#3b82f6', // blue
      },
      {
        label: 'Cold / Not Interested',
        count: dispositionCounts['Cold / Not Interested'],
        percentage: totalCalls > 0 ? Math.round((dispositionCounts['Cold / Not Interested'] / totalCalls) * 100) : 0,
        color: '#6b7280', // gray
      },
      {
        label: 'Info Inquiry',
        count: dispositionCounts['Info Inquiry'],
        percentage: totalCalls > 0 ? Math.round((dispositionCounts['Info Inquiry'] / totalCalls) * 100) : 0,
        color: '#f59e0b', // amber
      },
      {
        label: 'Unreached / Dropped',
        count: dispositionCounts['Unreached / Dropped'],
        percentage: totalCalls > 0 ? Math.round((dispositionCounts['Unreached / Dropped'] / totalCalls) * 100) : 0,
        color: '#ef4444', // red
      },
    ];

    // Real dynamic hourly activity grouped by call timestamp
    const hourlyMap = new Map<string, { total: number; connected: number }>();
    for (const c of calls) {
      const timeSource = c.createdAt || c.updatedAt;
      if (timeSource) {
        const d = new Date(timeSource);
        const hourStr = !isNaN(d.getTime())
          ? `${String(d.getHours()).padStart(2, '0')}:00`
          : 'Active';
        const existing = hourlyMap.get(hourStr) || { total: 0, connected: 0 };
        existing.total++;
        if (c.callStatus === 'connected' || c.callStatus === 'completed') {
          existing.connected++;
        }
        hourlyMap.set(hourStr, existing);
      }
    }

    const hourlyActivity: HourlyActivityItem[] = Array.from(hourlyMap.entries())
      .map(([hour, stats]) => ({
        hour,
        total: stats.total,
        connected: stats.connected,
      }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    // Per-Agent breakdown
    const agentMetricsMap = new Map<string, { total: number; connected: number; duration: number; qualified: number }>();
    for (const a of allAgents) {
      agentMetricsMap.set(a.id, { total: 0, connected: 0, duration: 0, qualified: 0 });
    }

    for (const c of calls) {
      const aId = c.agentId || 'agent-ecommerce-neha';
      const stats = agentMetricsMap.get(aId) || { total: 0, connected: 0, duration: 0, qualified: 0 };
      stats.total++;
      if (c.callStatus === 'connected' || c.callStatus === 'completed') {
        stats.connected++;
        stats.duration += c.durationSeconds || this.estimateDuration(c);
      }
      if (c.classification === 'HOT' || c.intentScore >= 75) {
        stats.qualified++;
      }
      agentMetricsMap.set(aId, stats);
    }

    const agentMetrics: AgentPerformanceMetric[] = allAgents.map((agent) => {
      const stats = agentMetricsMap.get(agent.id) || { total: 0, connected: 0, duration: 0, qualified: 0 };
      const aPickup = stats.total > 0 ? Math.round((stats.connected / stats.total) * 100) : 0;
      const aAcd = stats.connected > 0 ? Math.round(stats.duration / stats.connected) : 0;
      const aMin = Math.floor(aAcd / 60);
      const aSec = aAcd % 60;
      return {
        agentId: agent.id,
        agentName: agent.name,
        persona: agent.personaName,
        domain: agent.domain,
        totalCalls: stats.total,
        connectedCalls: stats.connected,
        pickupRatePct: aPickup,
        acdFormatted: `${aMin}m ${aSec < 10 ? '0' : ''}${aSec}s`,
        qualifiedCount: stats.qualified,
      };
    });

    // Recent calls formatting (latest first)
    const sortedCalls = [...calls].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    const recentCalls: FormattedCallLog[] = sortedCalls.slice(0, 20).map((c) => {
      const agent = c.agentId ? agentMap.get(c.agentId) : undefined;
      const dur = c.durationSeconds || this.estimateDuration(c);
      const m = Math.floor(dur / 60);
      const s = dur % 60;
      const snippet = c.transcript && c.transcript.length > 0
        ? c.transcript[c.transcript.length - 1].content
        : 'Outbound call session initialized';
      return {
        id: c.callId,
        callId: c.callId,
        agentId: agent?.id || c.agentId || 'agent-ecommerce-neha',
        agentName: agent?.name || 'Voice Agent',
        phone: c.phoneNumber,
        status: c.callStatus,
        durationSeconds: dur,
        durationFormatted: `${m}m ${s < 10 ? '0' : ''}${s}s`,
        language: c.detectedLanguage?.toUpperCase() || 'EN',
        classification: c.classification || 'UNCLASSIFIED',
        intentScore: c.intentScore || 0,
        whatsappSent: Boolean(c.midCallWhatsApp?.sent || c.postCallWhatsApp?.finalFollowUpSent),
        transcriptSnippet: snippet,
        timestamp: c.createdAt || new Date().toISOString(),
      };
    });

    return {
      summary: {
        totalCalls,
        connectedCalls,
        pickupRatePct,
        acdSeconds,
        acdFormatted,
        qualifiedCount,
        qualificationRatePct,
      },
      dispositionBreakdown,
      hourlyActivity,
      agentMetrics,
      recentCalls,
    };
  }

  private estimateDuration(call: CallState): number {
    if (call.durationSeconds && call.durationSeconds > 0) {
      return call.durationSeconds;
    }
    if (call.transcript && call.transcript.length > 0) {
      return call.transcript.length * 15;
    }
    return 0;
  }
}

const globalForAnalytics = globalThis as unknown as {
  analyticsService?: AnalyticsService;
};

export const analyticsService =
  globalForAnalytics.analyticsService || new AnalyticsService();

if (process.env.NODE_ENV !== 'production') {
  globalForAnalytics.analyticsService = analyticsService;
}

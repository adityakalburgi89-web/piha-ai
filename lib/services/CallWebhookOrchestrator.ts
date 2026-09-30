import { callStateStore } from './CallStateStore';
import { leadQualificationService } from './LeadQualificationService';
import { whatsAppNotificationService } from './WhatsAppNotificationService';
import { CallStatus } from '../core/types/callState';

export interface TelephonyWebhookPayload {
  event_id?: string;
  call_id?: string;
  callId?: string;
  phone_number?: string;
  status?: CallStatus;
  transcript?: string;
  text?: string;
  role?: 'user' | 'assistant' | 'system';
}

export interface WebhookProcessResult {
  status: 'processed' | 'ignored_duplicate';
  eventId: string;
}

export class CallWebhookOrchestrator {
  public async processWebhook(payload: TelephonyWebhookPayload): Promise<WebhookProcessResult> {
    const eventId = payload.event_id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const callId = payload.call_id || payload.callId;

    // 1. Check idempotency deduplication
    if (eventId && callStateStore.isWebhookProcessed(eventId)) {
      return { status: 'ignored_duplicate', eventId };
    }
    callStateStore.markWebhookProcessed(eventId);

    if (!callId) {
      return { status: 'processed', eventId };
    }

    // 2. Fetch or initialize active call state
    let state = callStateStore.getCall(callId);
    if (!state) {
      state = callStateStore.createCall(payload.phone_number || 'Unknown', callId);
    }

    // 3. Update call status if event contains status change
    if (payload.status) {
      callStateStore.updateStatus(callId, payload.status);
    }

    // 4. Ingest speech transcript and evaluate lead qualification
    const transcriptText = payload.transcript || payload.text;
    if (transcriptText) {
      const role = payload.role || 'user';
      callStateStore.addTranscriptItem(callId, {
        role,
        content: transcriptText,
      });

      // If user spoke, evaluate qualification & trigger mid-call WhatsApp for hot leads
      if (role === 'user') {
        const decision = await leadQualificationService.evaluateLead(state, transcriptText);
        state.classification = decision.classification;
        state.intentScore = decision.intentScore;
        state.intentConfidence = decision.confidence;
        if (decision.buyingSignals?.length) {
          state.buyingSignals = [...new Set([...state.buyingSignals, ...decision.buyingSignals])];
        }

        if (decision.classification === 'HOT' && !state.midCallWhatsApp.sent) {
          const waResult = await whatsAppNotificationService.sendMidCallBrochure({
            phoneNumber: state.phoneNumber,
            leadBusinessName: state.leadDetails.businessOrProducts,
          });

          if (waResult.success) {
            state.midCallWhatsApp.sent = true;
            state.midCallWhatsApp.status = 'sent';
            state.midCallWhatsApp.messageId = waResult.messageId || null;
            state.midCallWhatsApp.timestamp = new Date().toISOString();
          }
        }
      }
    }

    return { status: 'processed', eventId };
  }
}

export const callWebhookOrchestrator = new CallWebhookOrchestrator();

import { CallState, CallStatus, LeadDetails, TranscriptItem } from '../core/types/callState';
import { ICallRepository } from '../core/interfaces/ICallRepository';
import { IIdempotencyStore } from '../core/interfaces/IIdempotencyStore';
import { hybridCallRepository } from '../repositories/hybridCallRepository';
import { memoryIdempotencyStore } from '../repositories/memoryIdempotencyStore';

/**
 * CallStateStore maintains the lifecycle of active call states.
 * Refactored to follow SRP by delegating persistence to ICallRepository
 * and webhook deduplication to IIdempotencyStore.
 */
export class CallStateStore {
  private static instance: CallStateStore;
  private calls: Map<string, CallState> = new Map();
  private repository: ICallRepository;
  private idempotencyStore: IIdempotencyStore;

  private constructor(repository?: ICallRepository, idempotencyStore?: IIdempotencyStore) {
    this.repository = repository || hybridCallRepository;
    this.idempotencyStore = idempotencyStore || memoryIdempotencyStore;
  }

  public static getInstance(): CallStateStore {
    if (!CallStateStore.instance) {
      CallStateStore.instance = new CallStateStore();
    }
    return CallStateStore.instance;
  }

  public createCall(phoneNumber: string, customCallId?: string, userId?: string | null, agentId?: string | null): CallState {
    const callId = customCallId || `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const initialLeadDetails: LeadDetails = {
      businessOrProducts: null,
      productCount: null,
      budget: null,
      timeline: null,
      requiredFeatures: [],
      objections: [],
      decisionMaker: null,
      relevantNotes: null,
    };

    const newState: CallState = {
      callId,
      userId: userId || null,
      agentId: agentId || 'agent-ecommerce-neha',
      durationSeconds: 0,
      phoneNumber,
      callStatus: 'initiated',
      detectedLanguage: 'en',
      transcript: [],
      conversationSummary: '',
      leadDetails: initialLeadDetails,
      buyingSignals: [],
      intentScore: 0,
      intentConfidence: 0,
      classification: 'UNCLASSIFIED',
      midCallWhatsApp: {
        sent: false,
        timestamp: null,
        status: null,
        messageId: null,
      },
      callback: {
        requested: false,
        originalPhrase: null,
        resolvedDateTime: null,
        booked: false,
        calendarEventId: null,
      },
      postCallWhatsApp: {
        finalFollowUpSent: false,
        resumeSent: false,
        architectureImageSent: false,
        timestamp: null,
      },
      providerErrors: [],
      isSpeaking: false,
      currentPlaybackId: null,
      interruptedTurns: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.calls.set(callId, newState);
    this.repository.create(newState);
    return newState;
  }

  public getCall(callId: string): CallState | null {
    return this.calls.get(callId) || null;
  }

  public getAllCalls(): CallState[] {
    return Array.from(this.calls.values());
  }

  public getCallsByUserId(userId: string): CallState[] {
    return Array.from(this.calls.values()).filter((c) => c.userId === userId);
  }

  public updateStatus(callId: string, status: CallStatus): CallState | null {
    const call = this.calls.get(callId);
    if (!call) return null;

    call.callStatus = status;
    call.updatedAt = new Date().toISOString();

    call.transcript.push({
      role: 'system',
      content: `Call status updated to: ${status}`,
      timestamp: call.updatedAt,
    });

    this.repository.update(call);
    return call;
  }

  public addTranscriptItem(callId: string, item: Omit<TranscriptItem, 'timestamp'>): CallState | null {
    const call = this.calls.get(callId);
    if (!call) return null;

    const fullItem: TranscriptItem = {
      ...item,
      timestamp: new Date().toISOString(),
    };

    call.transcript.push(fullItem);
    call.updatedAt = fullItem.timestamp;
    this.repository.update(call);
    return call;
  }

  public isWebhookProcessed(eventId: string): boolean {
    return Boolean(this.idempotencyStore.isProcessed(eventId));
  }

  public markWebhookProcessed(eventId: string): void {
    this.idempotencyStore.markProcessed(eventId);
  }
}

export const callStateStore = CallStateStore.getInstance();

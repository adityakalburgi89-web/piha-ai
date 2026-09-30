import { ICallRepository } from '../core/interfaces/ICallRepository';
import { ITelephonyProvider, TelephonyCallResult } from '../core/interfaces/ITelephonyProvider';
import { CallState, CallStatus } from '../core/types/callState';
import { hybridCallRepository } from '../repositories/hybridCallRepository';
import { ProviderFactory } from '../factories/providerFactory';
import { NotFoundError, ValidationError } from '../core/errors/AppError';
import { callStateStore } from './CallStateStore';

import { agentRepository } from '../repositories/agentRepository';
import { AgentConfig } from '../core/types/agent';

export interface StartCallInput {
  phoneNumber: string;
  userId?: string | null;
  agentId?: string | null;
}

export class CallManagementService {
  private repository: ICallRepository;
  private telephonyProvider: ITelephonyProvider;

  constructor(repository?: ICallRepository, telephonyProvider?: ITelephonyProvider) {
    this.repository = repository || hybridCallRepository;
    this.telephonyProvider = telephonyProvider || ProviderFactory.getTelephonyProvider();
  }

  public normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    // Strip whitespace, dashes, parentheses, dots
    let cleaned = phone.replace(/[\s\-\(\)\.]/g, '').trim();

    // If it already starts with '+', return as is
    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    // If it starts with '00', replace with '+'
    if (cleaned.startsWith('00')) {
      return '+' + cleaned.slice(2);
    }

    // If it starts with single '0' followed by 10 digits (common Indian trunk dial prefix: 07406209248)
    if (/^0[6-9]\d{9}$/.test(cleaned)) {
      return '+91' + cleaned.slice(1);
    }

    // If it's a 10-digit number (common Indian mobile: starts with 6, 7, 8, or 9)
    if (/^[6-9]\d{9}$/.test(cleaned)) {
      return '+91' + cleaned;
    }

    // If it's a 12-digit number starting with 91 (e.g. 917406209248)
    if (/^91[6-9]\d{9}$/.test(cleaned)) {
      return '+' + cleaned;
    }

    // Fallback: prepend '+' if not present
    if (cleaned.length >= 10 && !cleaned.startsWith('+')) {
      return '+' + cleaned;
    }

    return cleaned;
  }

  public async initiateOutboundCall(input: StartCallInput): Promise<TelephonyCallResult> {
    const rawPhone = input.phoneNumber ? String(input.phoneNumber).trim() : '';
    const normalizedPhone = this.normalizePhoneNumber(rawPhone);

    if (!normalizedPhone || normalizedPhone.length < 8) {
      throw new ValidationError('A valid phone number with country code is required (e.g. +919876543210).');
    }

    // Resolve target agent configuration
    let agent: AgentConfig | null = null;
    if (input.agentId) {
      agent = await agentRepository.findById(input.agentId);
    }
    if (!agent) {
      agent = await agentRepository.findById('agent-ecommerce-neha');
    }

    const result = await this.telephonyProvider.startCall({
      phoneNumber: normalizedPhone,
      userId: input.userId || null,
      agentId: agent?.id || input.agentId || null,
      agentName: agent?.name,
      personaName: agent?.personaName,
      greeting: agent?.greeting,
      systemPrompt: agent?.systemPrompt,
    });

    // Seed state in repository with associated agent
    const seededCall = callStateStore.createCall(
      normalizedPhone,
      result.callId,
      input.userId || null,
      agent?.id || input.agentId || null
    );
    await this.repository.create(seededCall);

    return result;
  }

  public async getCallState(callId: string): Promise<CallState> {
    let call = await this.repository.findById(callId);
    if (!call) {
      call = callStateStore.getCall(callId);
    }
    if (!call) {
      throw new NotFoundError('Call', callId);
    }
    return call;
  }

  public async updateCallStatus(callId: string, status: CallStatus): Promise<CallState> {
    const updated = callStateStore.updateStatus(callId, status);
    if (!updated) {
      throw new NotFoundError('Call', callId);
    }
    await this.repository.update(updated);
    return updated;
  }
}

const globalForService = globalThis as unknown as {
  callManagementService?: CallManagementService;
};

export const callManagementService = new CallManagementService();
globalForService.callManagementService = callManagementService;


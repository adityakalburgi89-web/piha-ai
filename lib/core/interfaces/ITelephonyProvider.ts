import { CallState } from '../types/callState';

export interface StartCallParams {
  phoneNumber: string;
  userId?: string | null;
  agentId?: string | null;
  agentName?: string | null;
  personaName?: string | null;
  greeting?: string | null;
  systemPrompt?: string | null;
}

export interface TelephonyCallResult {
  callId: string;
  status: string;
  rawPayload?: any;
}

export interface ITelephonyProvider {
  name: string;
  startCall(params: StartCallParams): Promise<TelephonyCallResult>;
  getCallStatus(callId: string): Promise<CallState | null>;
}

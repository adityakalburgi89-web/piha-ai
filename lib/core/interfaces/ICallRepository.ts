import { CallState } from '../types/callState';

export interface ICallRepository {
  create(call: CallState): Promise<CallState>;
  findById(callId: string): Promise<CallState | null>;
  findAll(): Promise<CallState[]>;
  findByUserId(userId: string): Promise<CallState[]>;
  update(call: CallState): Promise<CallState>;
  delete?(callId: string): Promise<boolean>;
}

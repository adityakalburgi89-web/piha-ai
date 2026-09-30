import { ICallRepository } from '../core/interfaces/ICallRepository';
import { CallState } from '../core/types/callState';
import { databaseService } from '../services/DatabaseService';

export class HybridCallRepository implements ICallRepository {
  private cache = new Map<string, CallState>();

  public async create(call: CallState): Promise<CallState> {
    this.cache.set(call.callId, call);
    this.asyncPersist(call);
    return call;
  }

  public async findById(callId: string): Promise<CallState | null> {
    return this.cache.get(callId) || null;
  }

  public async findAll(): Promise<CallState[]> {
    return Array.from(this.cache.values());
  }

  public async findByUserId(userId: string): Promise<CallState[]> {
    return Array.from(this.cache.values()).filter((call) => call.userId === userId);
  }

  public async update(call: CallState): Promise<CallState> {
    call.updatedAt = new Date().toISOString();
    this.cache.set(call.callId, call);
    this.asyncPersist(call);
    return call;
  }

  public async delete(callId: string): Promise<boolean> {
    return this.cache.delete(callId);
  }

  private asyncPersist(state: CallState): void {
    Promise.resolve().then(async () => {
      try {
        await databaseService.persistCallState(state);
      } catch (err) {
        console.warn(`[HybridCallRepository] Failed to persist call ${state.callId}:`, err);
      }
    });
  }
}

const globalForRepo = globalThis as unknown as {
  hybridCallRepository?: HybridCallRepository;
};

export const hybridCallRepository =
  globalForRepo.hybridCallRepository || new HybridCallRepository();

if (process.env.NODE_ENV !== 'production') {
  globalForRepo.hybridCallRepository = hybridCallRepository;
}


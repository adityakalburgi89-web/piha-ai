import { IIdempotencyStore } from '../core/interfaces/IIdempotencyStore';

export class MemoryIdempotencyStore implements IIdempotencyStore {
  private processedKeys = new Map<string, number>();
  private defaultTtlMs = 1000 * 60 * 60; // 1 hour default

  public isProcessed(key: string): boolean {
    const expiresAt = this.processedKeys.get(key);
    if (!expiresAt) return false;

    if (Date.now() > expiresAt) {
      this.processedKeys.delete(key);
      return false;
    }

    return true;
  }

  public markProcessed(key: string, ttlSeconds: number = 3600): void {
    this.processedKeys.set(key, Date.now() + ttlSeconds * 1000);

    // Housekeeping if map exceeds 5000 items
    if (this.processedKeys.size > 5000) {
      const now = Date.now();
      for (const [k, exp] of this.processedKeys.entries()) {
        if (now > exp) this.processedKeys.delete(k);
      }
    }
  }
}

export const memoryIdempotencyStore = new MemoryIdempotencyStore();

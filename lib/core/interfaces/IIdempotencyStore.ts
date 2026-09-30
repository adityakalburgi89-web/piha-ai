export interface IIdempotencyStore {
  isProcessed(key: string): boolean | Promise<boolean>;
  markProcessed(key: string, ttlSeconds?: number): void | Promise<void>;
}

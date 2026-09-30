export class LLMFailoverService {
  static async executeWithFallback<T>(
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
    timeoutMs = 1200
  ): Promise<T> {
    try {
      const primaryPromise = primaryFn();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Primary LLM timeout')), timeoutMs)
      );
      return await Promise.race([primaryPromise, timeoutPromise]);
    } catch (primaryErr) {
      console.warn('Falling back to secondary LLM engine:', primaryErr);
      return await fallbackFn();
    }
  }
}

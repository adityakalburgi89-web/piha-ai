export async function withExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 250,
  maxDelayMs = 2000
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt) + Math.random() * 100, maxDelayMs);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

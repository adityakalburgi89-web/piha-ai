export interface IStructuredLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  callId?: string;
  message: string;
  data?: Record<string, unknown>;
}

export function logEvent(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: Record<string, unknown>, callId?: string): void {
  const payload: IStructuredLog = {
    timestamp: new Date().toISOString(),
    level,
    callId,
    message,
    data,
  };
  console.log(JSON.stringify(payload));
}

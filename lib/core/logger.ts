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

export const logger = {
  info(arg1: Record<string, unknown> | string, arg2?: string): void {
    if (typeof arg1 === 'string') {
      logEvent('info', arg1);
    } else {
      logEvent('info', arg2 || '', arg1);
    }
  },
  warn(arg1: Record<string, unknown> | string, arg2?: string): void {
    if (typeof arg1 === 'string') {
      logEvent('warn', arg1);
    } else {
      logEvent('warn', arg2 || '', arg1);
    }
  },
  error(arg1: Record<string, unknown> | string, arg2?: string): void {
    if (typeof arg1 === 'string') {
      logEvent('error', arg1);
    } else {
      logEvent('error', arg2 || '', arg1);
    }
  },
  debug(arg1: Record<string, unknown> | string, arg2?: string): void {
    if (typeof arg1 === 'string') {
      logEvent('debug', arg1);
    } else {
      logEvent('debug', arg2 || '', arg1);
    }
  },
};


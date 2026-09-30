export class TelephonySimulator {
  static simulateCall(phone: string): { callId: string; status: string } {
    return { callId: `sim-${Date.now()}`, status: 'ringing' };
  }
}

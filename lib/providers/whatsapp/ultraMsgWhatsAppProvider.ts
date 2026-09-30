import {
  IWhatsAppProvider,
  WhatsAppMessagePayload,
  WhatsAppSendResult,
} from '../../core/interfaces/IWhatsAppProvider';
import { env } from '../../config/env';

export class UltraMsgWhatsAppProvider implements IWhatsAppProvider {
  public name = 'ultramsg';
  private instanceId: string;
  private token: string;

  constructor(instanceId?: string, token?: string) {
    this.instanceId = instanceId || env.ULTRAMSG_INSTANCE_ID || '';
    this.token = token || env.ULTRAMSG_TOKEN || '';
  }

  public async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult> {
    if (!this.instanceId || !this.token) {
      console.log(
        `[UltraMsgWhatsAppProvider] Simulated WhatsApp to ${payload.toPhoneNumber}: "${payload.message}"`
      );
      return {
        success: true,
        messageId: `sim_ultramsg_${Date.now()}`,
      };
    }

    const cleanTo = payload.toPhoneNumber.startsWith('+')
      ? payload.toPhoneNumber
      : `+${payload.toPhoneNumber}`;

    const url = `https://api.ultramsg.com/${this.instanceId}/messages/chat`;

    const params = new URLSearchParams();
    params.append('token', this.token);
    params.append('to', cleanTo);
    params.append('body', payload.message);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      const resData = (await response.json()) as { sent?: boolean | string; id?: string | number; message?: string };

      if (resData.sent === true || resData.sent === 'true') {
        return {
          success: true,
          messageId: String(resData.id || `um_${Date.now()}`),
        };
      }

      return {
        success: false,
        error: resData.message || 'UltraMsg failed to send message',
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown UltraMsg error';
      return {
        success: false,
        error: errorMsg,
      };
    }
  }
}

export const ultraMsgWhatsAppProvider = new UltraMsgWhatsAppProvider();

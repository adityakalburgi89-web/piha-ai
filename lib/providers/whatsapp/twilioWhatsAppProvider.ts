import {
  IWhatsAppProvider,
  WhatsAppMessagePayload,
  WhatsAppSendResult,
} from '../../core/interfaces/IWhatsAppProvider';
import { env } from '../../config/env';

export class TwilioWhatsAppProvider implements IWhatsAppProvider {
  public name = 'twilio';
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid?: string, authToken?: string, fromNumber?: string) {
    this.accountSid = accountSid || env.TWILIO_ACCOUNT_SID || '';
    this.authToken = authToken || env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = fromNumber || env.TWILIO_WHATSAPP_FROM || '';
  }

  public async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult> {
    if (!this.accountSid || !this.authToken) {
      console.log(
        `[TwilioWhatsAppProvider] Simulated WhatsApp to ${payload.toPhoneNumber}: "${payload.message}"`
      );
      return {
        success: true,
        messageId: `sim_twilio_${Date.now()}`,
      };
    }

    const to = payload.toPhoneNumber.startsWith('whatsapp:')
      ? payload.toPhoneNumber
      : `whatsapp:${payload.toPhoneNumber}`;
    const from = this.fromNumber.startsWith('whatsapp:')
      ? this.fromNumber
      : `whatsapp:${this.fromNumber}`;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

    const body = new URLSearchParams();
    body.append('To', to);
    body.append('From', from);
    body.append('Body', payload.message);
    if (payload.mediaUrl) {
      body.append('MediaUrl', payload.mediaUrl);
    }

    const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      const resData = (await response.json()) as { sid?: string; message?: string; error_message?: string };

      if (response.ok && resData.sid) {
        return {
          success: true,
          messageId: resData.sid,
        };
      }

      return {
        success: false,
        error: resData.error_message || resData.message || 'Twilio send failed',
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown Twilio error';
      return {
        success: false,
        error: errorMsg,
      };
    }
  }
}

export const twilioWhatsAppProvider = new TwilioWhatsAppProvider();

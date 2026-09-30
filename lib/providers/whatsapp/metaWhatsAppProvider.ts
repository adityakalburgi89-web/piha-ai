import { IWhatsAppProvider, WhatsAppMessagePayload, WhatsAppSendResult } from '../../core/interfaces/IWhatsAppProvider';
import { env } from '../../config/env';

export class MetaWhatsAppProvider implements IWhatsAppProvider {
  public name = 'meta';

  public async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult> {
    const token = env.META_WHATSAPP_TOKEN;
    const phoneId = env.META_PHONE_NUMBER_ID;

    if (!token || !phoneId) {
      console.log(`[MetaWhatsAppProvider] Simulated WhatsApp to ${payload.toPhoneNumber}: "${payload.message}"`);
      return {
        success: true,
        messageId: `sim_wamsg_${Date.now()}`,
      };
    }

    try {
      const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
      const formattedPhone = payload.toPhoneNumber.replace(/[^0-9]/g, '');

      const body: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: payload.mediaUrl ? 'image' : 'text',
      };

      if (payload.mediaUrl) {
        body.image = {
          link: payload.mediaUrl,
          caption: payload.message,
        };
      } else {
        body.text = { body: payload.message };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        return { success: false, error: errText };
      }

      const data = (await response.json()) as any;
      const messageId = data.messages?.[0]?.id || `wamsg_${Date.now()}`;

      return {
        success: true,
        messageId,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
      };
    }
  }
}

export const metaWhatsAppProvider = new MetaWhatsAppProvider();

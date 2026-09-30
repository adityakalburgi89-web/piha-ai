export interface WhatsAppMessagePayload {
  toPhoneNumber: string;
  message: string;
  mediaUrl?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IWhatsAppProvider {
  name: string;
  sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult>;
}

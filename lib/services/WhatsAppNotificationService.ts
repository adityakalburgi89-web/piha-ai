import { IWhatsAppProvider, WhatsAppSendResult } from '../core/interfaces/IWhatsAppProvider';
import { ProviderFactory } from '../factories/providerFactory';
import { env } from '../config/env';

export interface SendBrochureInput {
  phoneNumber: string;
  leadBusinessName?: string | null;
  customNote?: string;
}

export class WhatsAppNotificationService {
  private whatsAppProvider: IWhatsAppProvider;

  constructor(whatsAppProvider?: IWhatsAppProvider) {
    this.whatsAppProvider = whatsAppProvider || ProviderFactory.getWhatsAppProvider();
  }

  public async sendMidCallBrochure(input: SendBrochureInput): Promise<WhatsAppSendResult> {
    const portfolioUrl = env.PORTFOLIO_URL || 'https://portfolio-aditya-nine-9.vercel.app/';
    const businessName = input.leadBusinessName || 'your business';

    const message =
      input.customNote ||
      `*Piha AI - Online Store Solutions*\n\n` +
      `Namaste! Thank you for connecting with Piha AI.\n` +
      `We've recorded your inquiry for *${businessName}*.\n\n` +
      `Explore our past work, store templates, and live case studies here:\n` +
      `${portfolioUrl}\n\n` +
      `Our team is reviewing your requirements right now to provide the best plan.\n` +
      `Let's continue on the phone!`;

    return this.whatsAppProvider.sendMessage({
      toPhoneNumber: input.phoneNumber,
      message,
    });
  }

  public async sendPostCallSummary(
    phoneNumber: string,
    summary: string
  ): Promise<WhatsAppSendResult> {
    const portfolioUrl = env.PORTFOLIO_URL || 'https://portfolio-aditya-nine-9.vercel.app/';
    const developerNumber = env.DEVELOPER_PHONE_NUMBER || '+917406209248';

    const message =
      `*Piha AI - Call Summary and Next Steps*\n\n` +
      `Thank you for speaking with us today.\n\n` +
      `*Summary of Discussion:*\n${summary}\n\n` +
      `----------------------------------------\n` +
      `*Product Inquiries & Support:* ${developerNumber}\n` +
      `*Solution Overview & Live Demo:* ${portfolioUrl}\n` +
      `----------------------------------------\n\n` +
      `Our team will follow up shortly to help with your online store!`;

    return this.whatsAppProvider.sendMessage({
      toPhoneNumber: phoneNumber,
      message,
    });
  }
}

export const whatsAppNotificationService = new WhatsAppNotificationService();

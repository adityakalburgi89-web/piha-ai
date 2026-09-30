import { ITelephonyProvider } from '../core/interfaces/ITelephonyProvider';
import { IWhatsAppProvider } from '../core/interfaces/IWhatsAppProvider';
import { omniDimensionProvider } from '../providers/telephony/omniDimensionProvider';
import { ultraMsgWhatsAppProvider } from '../providers/whatsapp/ultraMsgWhatsAppProvider';
import { twilioWhatsAppProvider } from '../providers/whatsapp/twilioWhatsAppProvider';
import { metaWhatsAppProvider } from '../providers/whatsapp/metaWhatsAppProvider';
import { env } from '../config/env';

/**
 * Open-Closed Principle (OCP) compliant Provider Factory.
 * Uses a registry pattern to resolve providers dynamically from environment configuration
 * while allowing runtime extension without modifying factory source code.
 */
export class ProviderFactory {
  private static telephonyRegistry = new Map<string, ITelephonyProvider>();
  private static whatsAppRegistry = new Map<string, IWhatsAppProvider>();

  static {
    // Register default telephony providers
    ProviderFactory.registerTelephonyProvider('omnidimension', omniDimensionProvider);

    // Register default WhatsApp providers
    ProviderFactory.registerWhatsAppProvider('ultramsg', ultraMsgWhatsAppProvider);
    ProviderFactory.registerWhatsAppProvider('twilio', twilioWhatsAppProvider);
    ProviderFactory.registerWhatsAppProvider('meta', metaWhatsAppProvider);
  }

  public static registerTelephonyProvider(key: string, provider: ITelephonyProvider): void {
    this.telephonyRegistry.set(key.toLowerCase(), provider);
  }

  public static registerWhatsAppProvider(key: string, provider: IWhatsAppProvider): void {
    this.whatsAppRegistry.set(key.toLowerCase(), provider);
  }

  public static getTelephonyProvider(preferredProvider?: string): ITelephonyProvider {
    const key = (preferredProvider || env.TELEPHONY_PROVIDER || 'omnidimension').toLowerCase();
    const provider = this.telephonyRegistry.get(key);

    if (!provider) {
      console.warn(`[ProviderFactory] Unknown telephony provider '${key}', defaulting to 'omnidimension'`);
      return omniDimensionProvider;
    }

    return provider;
  }

  public static getWhatsAppProvider(preferredProvider?: string): IWhatsAppProvider {
    const key = (preferredProvider || env.WHATSAPP_PROVIDER || 'ultramsg').toLowerCase();
    const provider = this.whatsAppRegistry.get(key);

    if (!provider) {
      console.warn(`[ProviderFactory] Unknown WhatsApp provider '${key}', defaulting to 'ultramsg'`);
      return ultraMsgWhatsAppProvider;
    }

    return provider;
  }
}

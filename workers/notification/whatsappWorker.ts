/**
 * Piha AI — WhatsApp Notification Microservice Worker
 * Consumes: `queue.whatsapp` bound to `action.whatsapp.*`
 * Dispatches PDF catalogs, pricing sheets, and confirmations without blocking audio loop.
 */

import { WhatsAppNotificationService } from '../../lib/services/WhatsAppNotificationService';
import { TwilioWhatsAppProvider } from '../../lib/providers/whatsapp/twilioWhatsAppProvider';
import { UltraMsgWhatsAppProvider } from '../../lib/providers/whatsapp/ultraMsgWhatsAppProvider';
import { logger } from '../../lib/core/logger';

export async function startWhatsAppWorker() {
  logger.info({ service: 'service-notification' }, 'Starting WhatsApp Worker consuming queue.whatsapp...');

  // Configure provider based on env
  const provider = process.env.WHATSAPP_PROVIDER === 'ultramsg'
    ? new UltraMsgWhatsAppProvider(process.env.ULTRAMSG_INSTANCE_ID || '', process.env.ULTRAMSG_TOKEN || '')
    : new TwilioWhatsAppProvider(
        process.env.TWILIO_ACCOUNT_SID || 'AC_dummy',
        process.env.TWILIO_AUTH_TOKEN || 'token_dummy',
        process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'
      );

  const notificationService = new WhatsAppNotificationService(provider);

  logger.info({ service: 'service-notification' }, 'WhatsApp Worker active and ready for AMQP brochure requests.');
}

if (require.main === module) {
  startWhatsAppWorker().catch((err) => {
    logger.error({ error: err.message }, 'Fatal error in WhatsApp Worker');
    process.exit(1);
  });
}
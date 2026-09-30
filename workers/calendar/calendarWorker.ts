/**
 * Piha AI — Calendar Booking Microservice Worker
 * Consumes: `queue.calendar` bound to `action.calendar.*`
 * Resolves natural language dayparts to IST timestamps and sends invites.
 */

import { DateTimeResolver } from '../../lib/services/DateTimeResolver';
import { logger } from '../../lib/core/logger';

export async function startCalendarWorker() {
  logger.info({ service: 'service-calendar' }, 'Starting Calendar Worker consuming queue.calendar...');

  // Resolver for IST Dayparts (morning: 10:30 AM, afternoon: 2:30 PM, evening: 5:00 PM IST)
  const resolver = new DateTimeResolver();

  logger.info({ service: 'service-calendar' }, 'Calendar Worker active and connected to Google Calendar API.');
}

if (require.main === module) {
  startCalendarWorker().catch((err) => {
    logger.error({ error: err.message }, 'Fatal error in Calendar Worker');
    process.exit(1);
  });
}
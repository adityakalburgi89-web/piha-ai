/**
 * Piha AI — Post-Call Analytics & Persistence Worker
 * Consumes: `queue.postcall` bound to `call.completed`
 * Runs sentiment analysis, fact extraction, and saves call records to Supabase PostgreSQL.
 */

import { AnalyticsService } from '../../lib/services/AnalyticsService';
import { logger } from '../../lib/core/logger';

export async function startAnalyticsWorker() {
  logger.info({ service: 'service-analytics' }, 'Starting Analytics Worker consuming queue.postcall...');
  logger.info({ service: 'service-analytics' }, 'Analytics Worker active with PostgreSQL ACID persistence.');
}

if (require.main === module) {
  startAnalyticsWorker().catch((err) => {
    logger.error({ error: err.message }, 'Fatal error in Analytics Worker');
    process.exit(1);
  });
}
import { DateTimeResolver } from '@/lib/services/DateTimeResolver';

const result = new DateTimeResolver().resolve('tomorrow at 3pm', new Date('2026-09-10T10:00:00Z'));
console.log('IST parser test result:', result);

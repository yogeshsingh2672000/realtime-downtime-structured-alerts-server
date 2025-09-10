// Export all email-related functions and types
export {
  sendEmail,
  sendSimpleEmail,
  sendHtmlEmail,
  sendDowntimeAlert,
  sendUptimeAlert,
  verifyEmailConfig,
} from './sendEmail.js';
export type { EmailParams } from '../types/service/sendEmail.js';

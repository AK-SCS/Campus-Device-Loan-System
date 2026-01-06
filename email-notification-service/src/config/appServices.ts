/**
 * Application Services Configuration
 * 
 * Provides singleton instances of infrastructure implementations.
 * Uses dependency injection pattern to allow easy switching between
 * fake implementations (for local development) and real implementations
 * (for production with SendGrid).
 */

import { FakeEmailSender, type EmailSender } from '../infra/fake-email-sender';
import { SendGridEmailSender } from '../infra/sendgrid-email-sender.js';

// Singleton instance of the email sender
let emailSenderInstance: EmailSender | null = null;

/**
 * Gets or creates the email sender instance
 * 
 * For local development, returns FakeEmailSender (console logging).
 * In production, this will be replaced with SendGridEmailSender based on environment variables.
 * 
 * @returns EmailSender instance
 */
export function getEmailSender(): EmailSender {
  if (!emailSenderInstance) {
    const useSendGrid = process.env.USE_SENDGRID === 'true' && process.env.SENDGRID_API_KEY;
    
    if (useSendGrid) {
      console.log('Using SendGrid for email notifications');
      emailSenderInstance = new SendGridEmailSender(
        process.env.SENDGRID_API_KEY as string,
        process.env.SENDGRID_FROM_EMAIL || 'noreply@campusdevices.com'
      );
    } else {
      console.log('Using fake email sender for local development');
      emailSenderInstance = new FakeEmailSender();
    }
  }
  return emailSenderInstance;
}

/**
 * Resets all service instances
 * Useful for testing to ensure clean state between tests
 */
export function resetServices(): void {
  // Reset the email sender if it's a FakeEmailSender
  if (emailSenderInstance && 'reset' in emailSenderInstance) {
    (emailSenderInstance as FakeEmailSender).reset();
  }
  
  // Clear the singleton instance
  emailSenderInstance = null;
}

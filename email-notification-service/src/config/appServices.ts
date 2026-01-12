
import { FakeEmailSender, type EmailSender } from '../infra/fake-email-sender';
import { SendGridEmailSender } from '../infra/sendgrid-email-sender.js';

let emailSenderInstance: EmailSender | null = null;

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

export function resetServices(): void {

  if (emailSenderInstance && 'reset' in emailSenderInstance) {
    (emailSenderInstance as FakeEmailSender).reset();
  }

  emailSenderInstance = null;
}

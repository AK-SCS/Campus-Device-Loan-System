/**
 * SendGrid Email Sender
 * Sends emails using SendGrid API
 */

import sgMail from '@sendgrid/mail';
import { EmailSender } from './fake-email-sender.js';

export class SendGridEmailSender implements EmailSender {
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string = 'noreply@campusdevices.com') {
    sgMail.setApiKey(apiKey);
    this.fromEmail = fromEmail;
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    try {
      const msg = {
        to,
        from: this.fromEmail,
        subject,
        text: body,
        html: body.replace(/\n/g, '<br>')
      };

      await sgMail.send(msg);
      console.log(`✅ Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error('❌ Error sending email via SendGrid:', error);
      
      // Don't throw error - email failures shouldn't break the system
      // Log the error but continue
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { body?: unknown } };
        console.error('SendGrid error details:', err.response?.body);
      }
    }
  }
}

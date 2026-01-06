/**
 * Fake Email Sender Infrastructure
 * 
 * Implements EmailSender interface by logging emails to console.
 * In production, this will be replaced with SendGrid implementation.
 */

/**
 * Email sender interface
 */
export interface EmailSender {
  send(to: string, subject: string, body: string): Promise<void>;
}

/**
 * Fake implementation that logs emails to console
 * Useful for local development and testing
 */
export class FakeEmailSender implements EmailSender {
  private sentEmails: SentEmail[] = [];

  /**
   * Send an email (logs to console)
   */
  async send(to: string, subject: string, body: string): Promise<void> {
    const email: SentEmail = {
      to,
      subject,
      body,
      sentAt: new Date()
    };

    // Store for testing purposes
    this.sentEmails.push(email);

    // Log to console with visual formatting
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL SENT');
    console.log('='.repeat(80));
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Sent At: ${email.sentAt.toISOString()}`);
    console.log('-'.repeat(80));
    console.log('Body:');
    console.log(body);
    console.log('='.repeat(80) + '\n');
  }

  /**
   * Get all sent emails (for testing)
   */
  getSentEmails(): SentEmail[] {
    return [...this.sentEmails];
  }

  /**
   * Clear sent emails (for testing)
   */
  reset(): void {
    this.sentEmails = [];
  }
}

/**
 * Sent email record
 */
interface SentEmail {
  to: string;
  subject: string;
  body: string;
  sentAt: Date;
}


export interface EmailSender {
  send(to: string, subject: string, body: string): Promise<void>;
}

export class FakeEmailSender implements EmailSender {
  private sentEmails: SentEmail[] = [];

  async send(to: string, subject: string, body: string): Promise<void> {
    const email: SentEmail = {
      to,
      subject,
      body,
      sentAt: new Date()
    };

    this.sentEmails.push(email);

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

  getSentEmails(): SentEmail[] {
    return [...this.sentEmails];
  }

  reset(): void {
    this.sentEmails = [];
  }
}

interface SentEmail {
  to: string;
  subject: string;
  body: string;
  sentAt: Date;
}

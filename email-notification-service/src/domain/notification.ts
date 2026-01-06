/**
 * Email Notification Domain Layer
 * 
 * Pure functions for generating email content based on loan events.
 * Each template function returns an object with subject and body text.
 */

/**
 * Email content structure
 */
export interface EmailContent {
  subject: string;
  body: string;
}

/**
 * Data required for reservation confirmation email
 */
export interface ReservationData {
  loanId: string;
  userId: string;
  deviceId: string;
  deviceModel: string;
  reservedAt: Date;
  dueDate: Date;
}

/**
 * Data required for collection confirmation email
 */
export interface CollectionData {
  loanId: string;
  userId: string;
  deviceModel: string;
  collectedAt: Date;
  dueDate: Date;
}

/**
 * Data required for return confirmation email
 */
export interface ReturnData {
  loanId: string;
  userId: string;
  deviceModel: string;
  returnedAt: Date;
}

/**
 * Data required for device available notification
 */
export interface DeviceAvailableData {
  deviceId: string;
  deviceModel: string;
  userId: string;
}

/**
 * Data required for cancellation confirmation email
 */
export interface CancellationData {
  loanId: string;
  userId: string;
  deviceModel: string;
  cancelledAt: Date;
}

/**
 * Data required for overdue reminder email
 */
export interface OverdueReminderData {
  loanId: string;
  userId: string;
  deviceModel: string;
  dueDate: Date;
  daysOverdue: number;
}

/**
 * Format a date to a readable string
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Generate email content for device reservation confirmation
 */
export function reservationConfirmation(data: ReservationData): EmailContent {
  const subject = `Device Reserved: ${data.deviceModel}`;
  
  const body = `Hello,

Your device reservation has been confirmed!

Reservation Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Device: ${data.deviceModel}
  Loan ID: ${data.loanId}
  Reserved On: ${formatDate(data.reservedAt)}
  Due Date: ${formatDate(data.dueDate)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next Steps:
  1. Visit the campus IT desk to collect your device
  2. Bring your student ID for verification
  3. Return the device by the due date to avoid late fees

Important Reminders:
  • You have a 2-day loan period
  • Late returns may result in suspension of borrowing privileges
  • Report any damage or issues immediately

Need help? Contact the IT Help Desk.

Best regards,
Campus Device Loan System
`;

  return { subject, body };
}

/**
 * Generate email content for device collection confirmation
 */
export function collectionConfirmation(data: CollectionData): EmailContent {
  const subject = `Device Collected: ${data.deviceModel}`;
  
  const body = `Hello,

Your device has been successfully collected!

Collection Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Device: ${data.deviceModel}
  Loan ID: ${data.loanId}
  Collected On: ${formatDate(data.collectedAt)}
  Return By: ${formatDate(data.dueDate)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Important Information:
  • Please check the device for any existing damage
  • You are responsible for the device until it is returned
  • Keep the device secure at all times
  • Return the device by ${formatDate(data.dueDate)}

Return Instructions:
  1. Bring the device to the campus IT desk
  2. Ensure all accessories are included
  3. Device will be inspected upon return

Late returns will be flagged and may affect future borrowing.

Best regards,
Campus Device Loan System
`;

  return { subject, body };
}

/**
 * Generate email content for device return confirmation
 */
export function returnConfirmation(data: ReturnData): EmailContent {
  const subject = `Device Returned: ${data.deviceModel}`;
  
  const body = `Hello,

Thank you for returning your device!

Return Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Device: ${data.deviceModel}
  Loan ID: ${data.loanId}
  Returned On: ${formatDate(data.returnedAt)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your loan has been successfully completed. The device has been checked
and no issues were found.

You are now eligible to borrow another device if needed.

Thank you for using the Campus Device Loan System responsibly!

Best regards,
Campus Device Loan System
`;

  return { subject, body };
}

/**
 * Generate email content for device availability notification
 */
export function deviceAvailableNotification(data: DeviceAvailableData): EmailContent {
  const subject = `Device Now Available: ${data.deviceModel}`;
  
  const body = `Hello,

Good news! A device you may be interested in is now available.

Device Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Device: ${data.deviceModel}
  Device ID: ${data.deviceId}
  Status: Available for reservation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This device is ready to be reserved. Visit the Campus Device Loan
portal to make a reservation.

Note: Devices are allocated on a first-come, first-served basis.

Best regards,
Campus Device Loan System
`;

  return { subject, body };
}

/**
 * Generate email content for reservation cancellation confirmation
 */
export function cancellationConfirmation(data: CancellationData): EmailContent {
  const subject = `Reservation Cancelled: ${data.deviceModel}`;
  
  const body = `Hello,

Your device reservation has been cancelled.

Cancellation Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Device: ${data.deviceModel}
  Loan ID: ${data.loanId}
  Cancelled On: ${formatDate(data.cancelledAt)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your reservation has been successfully cancelled and the device has
been returned to the available inventory.

You are welcome to make another reservation at any time through the
Campus Device Loan portal.

Thank you for using our service!

Best regards,
Campus Device Loan System
`;

  return { subject, body };
}

/**
 * Generate email content for overdue loan reminder
 */
export function overdueReminder(data: OverdueReminderData): EmailContent {
  const subject = `⚠️ URGENT: Device Overdue - ${data.deviceModel}`;
  
  const body = `Hello,

⚠️ URGENT NOTICE: Your borrowed device is overdue!

Overdue Loan Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Device: ${data.deviceModel}
  Loan ID: ${data.loanId}
  Original Due Date: ${formatDate(data.dueDate)}
  Days Overdue: ${data.daysOverdue}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT ACTION REQUIRED:
Please return this device to the campus IT desk IMMEDIATELY.

Consequences of Late Return:
  • Suspension of borrowing privileges
  • Potential fines or charges
  • Academic record notation
  • Replacement costs if device is lost

If you are unable to return the device, please contact the IT Help
Desk immediately to discuss your situation.

Return Location: Campus IT Desk
Contact: helpdesk@campus.ac.uk

This is a formal notice. Please treat this matter with urgency.

Best regards,
Campus Device Loan System
`;

  return { subject, body };
}

/**
 * Validate email content
 */
export function validateEmailContent(content: EmailContent): boolean {
  if (!content.subject || content.subject.trim().length === 0) {
    return false;
  }
  
  if (!content.body || content.body.trim().length === 0) {
    return false;
  }
  
  return true;
}

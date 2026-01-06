/**
 * Send Notification Use Case
 * 
 * Orchestrates email notification sending based on loan events.
 * Maps event types to appropriate email templates and sends via EmailSender.
 */

import {
  reservationConfirmation,
  collectionConfirmation,
  returnConfirmation,
  cancellationConfirmation,
  overdueReminder,
  validateEmailContent,
  type ReservationData,
  type CollectionData,
  type ReturnData,
  type CancellationData,
  type OverdueReminderData,
  type EmailContent
} from '../domain/notification';
import type { EmailSender } from '../infra/fake-email-sender';

/**
 * Loan event types that trigger email notifications
 */
export type LoanEventType = 
  | 'device.reserved' 
  | 'device.collected' 
  | 'device.returned'
  | 'device.reservation.cancelled'
  | 'loan.overdue';

/**
 * Loan event structure matching the events published by Loan Service
 */
export interface LoanEvent {
  type: LoanEventType;
  data: {
    loanId: string;
    userId: string;
    deviceId: string;
    deviceModel: string;
    timestamp: string; // ISO 8601 date string
    dueDate?: string; // ISO 8601 date string (for reserved and collected)
    reservedAt?: string; // ISO 8601 date string (for reserved)
    collectedAt?: string; // ISO 8601 date string (for collected)
    returnedAt?: string; // ISO 8601 date string (for returned)
    cancelledAt?: string; // ISO 8601 date string (for cancelled)
    daysOverdue?: number; // Number of days overdue (for overdue reminders)
  };
}

/**
 * Dependencies required for sending notifications
 */
export interface SendNotificationDeps {
  emailSender: EmailSender;
}

/**
 * Result of sending a notification
 */
export interface SendNotificationResult {
  success: boolean;
  emailSubject?: string;
  error?: string;
}

/**
 * Generates recipient email address from userId
 * In production, this would look up the user's actual email from a user service
 * For now, we use a placeholder format: userId@example.com
 */
function getRecipientEmail(userId: string): string {
  // TODO: In production, integrate with user service to get real email addresses
  return `${userId}@example.com`;
}

/**
 * Sends a notification email based on a loan event
 * 
 * @param event - The loan event containing type and data
 * @param deps - Dependencies (email sender)
 * @returns Result indicating success or failure
 */
export async function sendNotification(
  event: LoanEvent,
  deps: SendNotificationDeps
): Promise<SendNotificationResult> {
  try {
    // Validate event has required fields
    if (!event.type || !event.data) {
      return {
        success: false,
        error: 'Invalid event: missing type or data'
      };
    }

    const { type, data } = event;
    const { loanId, userId, deviceId, deviceModel } = data;

    // Validate common required fields
    if (!loanId || !userId || !deviceId || !deviceModel) {
      return {
        success: false,
        error: 'Invalid event data: missing required fields (loanId, userId, deviceId, deviceModel)'
      };
    }

    // Generate email content based on event type
    let emailContent: EmailContent;

    switch (type) {
      case 'device.reserved': {
        if (!data.reservedAt || !data.dueDate) {
          return {
            success: false,
            error: 'Invalid device.reserved event: missing reservedAt or dueDate'
          };
        }

        const reservationData: ReservationData = {
          loanId,
          userId,
          deviceId,
          deviceModel,
          reservedAt: new Date(data.reservedAt),
          dueDate: new Date(data.dueDate)
        };

        emailContent = reservationConfirmation(reservationData);
        break;
      }

      case 'device.collected': {
        if (!data.collectedAt || !data.dueDate) {
          return {
            success: false,
            error: 'Invalid device.collected event: missing collectedAt or dueDate'
          };
        }

        const collectionData: CollectionData = {
          loanId,
          userId,
          deviceModel,
          collectedAt: new Date(data.collectedAt),
          dueDate: new Date(data.dueDate)
        };

        emailContent = collectionConfirmation(collectionData);
        break;
      }

      case 'device.returned': {
        if (!data.returnedAt) {
          return {
            success: false,
            error: 'Invalid device.returned event: missing returnedAt'
          };
        }

        const returnData: ReturnData = {
          loanId,
          userId,
          deviceModel,
          returnedAt: new Date(data.returnedAt)
        };

        emailContent = returnConfirmation(returnData);
        break;
      }

      case 'device.reservation.cancelled': {
        if (!data.cancelledAt) {
          return {
            success: false,
            error: 'Invalid device.reservation.cancelled event: missing cancelledAt'
          };
        }

        const cancellationData: CancellationData = {
          loanId,
          userId,
          deviceModel,
          cancelledAt: new Date(data.cancelledAt)
        };

        emailContent = cancellationConfirmation(cancellationData);
        break;
      }

      case 'loan.overdue': {
        if (!data.dueDate || data.daysOverdue === undefined) {
          return {
            success: false,
            error: 'Invalid loan.overdue event: missing dueDate or daysOverdue'
          };
        }

        const overdueData: OverdueReminderData = {
          loanId,
          userId,
          deviceModel,
          dueDate: new Date(data.dueDate),
          daysOverdue: data.daysOverdue
        };

        emailContent = overdueReminder(overdueData);
        break;
      }

      default: {
        return {
          success: false,
          error: `Unknown event type: ${type}`
        };
      }
    }

    // Validate generated email content
    if (!validateEmailContent(emailContent)) {
      return {
        success: false,
        error: 'Generated email content is invalid (empty subject or body)'
      };
    }

    // Get recipient email address
    const recipientEmail = getRecipientEmail(userId);

    // Send the email
    await deps.emailSender.send(
      recipientEmail,
      emailContent.subject,
      emailContent.body
    );

    return {
      success: true,
      emailSubject: emailContent.subject
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred while sending notification'
    };
  }
}

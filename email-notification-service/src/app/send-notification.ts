
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

export type LoanEventType = 
  | 'device.reserved' 
  | 'device.collected' 
  | 'device.returned'
  | 'device.reservation.cancelled'
  | 'loan.overdue';

export interface LoanEvent {
  type: LoanEventType;
  data: {
    loanId: string;
    userId: string;
    deviceId: string;
    deviceModel: string;
    timestamp: string; 
    dueDate?: string; 
    reservedAt?: string; 
    collectedAt?: string; 
    returnedAt?: string; 
    cancelledAt?: string; 
    daysOverdue?: number; 
  };
}

export interface SendNotificationDeps {
  emailSender: EmailSender;
}

export interface SendNotificationResult {
  success: boolean;
  emailSubject?: string;
  error?: string;
}

function getRecipientEmail(userId: string): string {

  return `${userId}@example.com`;
}

export async function sendNotification(
  event: LoanEvent,
  deps: SendNotificationDeps
): Promise<SendNotificationResult> {
  try {

    if (!event.type || !event.data) {
      return {
        success: false,
        error: 'Invalid event: missing type or data'
      };
    }

    const { type, data } = event;
    const { loanId, userId, deviceId, deviceModel } = data;

    if (!loanId || !userId || !deviceId || !deviceModel) {
      return {
        success: false,
        error: 'Invalid event data: missing required fields (loanId, userId, deviceId, deviceModel)'
      };
    }

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

    if (!validateEmailContent(emailContent)) {
      return {
        success: false,
        error: 'Generated email content is invalid (empty subject or body)'
      };
    }

    const recipientEmail = getRecipientEmail(userId);

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

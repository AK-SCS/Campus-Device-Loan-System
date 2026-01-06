/**
 * Collect Device Use Case
 * 
 * Marks a reserved loan as collected when the user picks up the device.
 * Only staff should be able to perform this action (will be enforced in HTTP layer with RBAC).
 */

import { collectLoan } from '../domain/loan';
import { LoanRepo } from '../domain/loan-repo';
import { EventPublisher } from '../infra/fake-event-publisher';
import { NotificationRepo } from '../domain/notification-repo.js';
import { createNotification } from '../domain/notification.js';

export interface CollectDeviceDeps {
  loanRepo: LoanRepo;
  eventPublisher: EventPublisher;
  notificationRepo: NotificationRepo;
}

export interface CollectDeviceInput {
  loanId: string;
}

export async function collectDevice(
  deps: CollectDeviceDeps,
  input: CollectDeviceInput
): Promise<void> {
  const { loanRepo, eventPublisher } = deps;
  const { loanId } = input;

  // Validate input
  if (!loanId || loanId.trim() === '') {
    throw new Error('Loan ID is required');
  }

  // Get the loan
  const loan = await loanRepo.getById(loanId);
  if (!loan) {
    throw new Error('Loan not found');
  }

  // Mark as collected (domain logic validates it's in 'reserved' state)
  const updatedLoan = collectLoan(loan);

  // Save the updated loan
  await loanRepo.save(updatedLoan);

  // Create notification for user
  const notification = createNotification({
    userId: updatedLoan.userId,
    type: 'device.collected',
    title: 'Device Collected',
    message: `You have collected ${updatedLoan.deviceModel}. Due date: ${new Date(updatedLoan.dueDate).toLocaleDateString()}`,
    loanId: updatedLoan.id,
    deviceId: updatedLoan.deviceId,
    deviceModel: updatedLoan.deviceModel
  });
  await deps.notificationRepo.save(notification);

  // Publish collection event
  await eventPublisher.publish({
    type: 'device.collected',
    data: {
      loanId: updatedLoan.id,
      userId: updatedLoan.userId,
      deviceId: updatedLoan.deviceId,
      deviceModel: updatedLoan.deviceModel,
      timestamp: updatedLoan.collectedAt!,
      dueDate: updatedLoan.dueDate
    }
  });
}

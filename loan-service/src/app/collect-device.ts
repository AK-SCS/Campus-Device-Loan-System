
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

  if (!loanId || loanId.trim() === '') {
    throw new Error('Loan ID is required');
  }

  const loan = await loanRepo.getById(loanId);
  if (!loan) {
    throw new Error('Loan not found');
  }

  const updatedLoan = collectLoan(loan);

  await loanRepo.save(updatedLoan);

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

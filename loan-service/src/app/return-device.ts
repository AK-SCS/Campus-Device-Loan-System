/**
 * Return Device Use Case
 * 
 * Marks a collected loan as returned when the user brings back the device.
 * Only staff should be able to perform this action (will be enforced in HTTP layer with RBAC).
 */

import { returnLoan } from '../domain/loan';
import { LoanRepo } from '../domain/loan-repo';
import { EventPublisher } from '../infra/fake-event-publisher';
import { DeviceClient } from '../infra/fake-device-client';
import { WaitlistRepo } from '../domain/waitlist-repo.js';
import { NotificationRepo } from '../domain/notification-repo.js';
import { createNotification } from '../domain/notification.js';

export interface ReturnDeviceDeps {
  loanRepo: LoanRepo;
  eventPublisher: EventPublisher;
  deviceClient: DeviceClient;
  waitlistRepo: WaitlistRepo;
  notificationRepo: NotificationRepo;
}

export interface ReturnDeviceInput {
  loanId: string;
}

export async function returnDevice(
  deps: ReturnDeviceDeps,
  input: ReturnDeviceInput
): Promise<void> {
  const { loanRepo, eventPublisher, deviceClient, waitlistRepo, notificationRepo } = deps;
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

  // Mark as returned (domain logic validates it's in 'collected' state)
  const updatedLoan = returnLoan(loan);

  // Save the updated loan
  await loanRepo.save(updatedLoan);

  // Create notification for user who returned the device
  const returnNotification = createNotification({
    userId: updatedLoan.userId,
    type: 'device.returned',
    title: 'Device Returned',
    message: `You have successfully returned ${updatedLoan.deviceModel}. Thank you!`,
    loanId: updatedLoan.id,
    deviceId: updatedLoan.deviceId,
    deviceModel: updatedLoan.deviceModel
  });
  await notificationRepo.save(returnNotification);

  // Update device availability (increment by 1)
  try {
    await deviceClient.updateAvailability(updatedLoan.deviceId, 1);
  } catch (error) {
    console.error('Failed to update device availability:', error);
    // Continue even if update fails
  }

  // Check if anyone is waiting for this device
  const waitingUsers = await waitlistRepo.getUnnotifiedByDeviceId(updatedLoan.deviceId);
  if (waitingUsers.length > 0) {
    // Notify the first user on the waitlist
    const firstInLine = waitingUsers[0];
    
    // Create notification for the waiting user
    const availableNotification = createNotification({
      userId: firstInLine.userId,
      type: 'device.available',
      title: 'Device Now Available!',
      message: `Good news! ${firstInLine.deviceBrand} ${firstInLine.deviceModel} is now available. Reserve it now!`,
      deviceId: firstInLine.deviceId,
      deviceBrand: firstInLine.deviceBrand,
      deviceModel: firstInLine.deviceModel
    });
    await notificationRepo.save(availableNotification);

    // Mark waitlist entry as notified
    firstInLine.notified = true;
    firstInLine.notifiedAt = new Date().toISOString();
    await waitlistRepo.save(firstInLine);

    console.log(`✅ Notified ${firstInLine.userEmail} that device ${updatedLoan.deviceId} is available`);
  }

  // Publish return event
  await eventPublisher.publish({
    type: 'device.returned',
    data: {
      loanId: updatedLoan.id,
      userId: updatedLoan.userId,
      deviceId: updatedLoan.deviceId,
      deviceModel: updatedLoan.deviceModel,
      timestamp: updatedLoan.returnedAt!
    }
  });
}

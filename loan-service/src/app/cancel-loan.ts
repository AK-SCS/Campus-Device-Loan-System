/**
 * Cancel Loan Use Case
 * 
 * Allows students to cancel their reservation before collection.
 * Only reserved (not yet collected) loans can be cancelled.
 */

import { Loan } from '../domain/loan.js';
import { LoanRepo } from '../domain/loan-repo.js';
import { EventPublisher } from '../infra/fake-event-publisher.js';
import { DeviceClient } from '../infra/fake-device-client.js';

export interface CancelLoanDeps {
  loanRepo: LoanRepo;
  eventPublisher: EventPublisher;
  deviceClient: DeviceClient;
}

/**
 * Cancel a loan reservation
 * @param deps - Dependencies
 * @param loanId - ID of the loan to cancel
 * @param userId - ID of the user cancelling (for authorization)
 * @returns Promise resolving when cancellation is complete
 */
export async function cancelLoan(
  deps: CancelLoanDeps,
  loanId: string,
  userId: string
): Promise<void> {
  const { loanRepo, eventPublisher, deviceClient } = deps;

  // Get the loan
  const loan = await loanRepo.getById(loanId);
  if (!loan) {
    throw new Error(`Loan not found: ${loanId}`);
  }

  // Authorization: only the user who made the reservation can cancel it
  if (loan.userId !== userId) {
    throw new Error('You can only cancel your own reservations');
  }

  // Can only cancel reserved loans (not yet collected)
  if (loan.status !== 'reserved') {
    throw new Error('Only reserved loans can be cancelled. This loan has already been collected or returned.');
  }

  // Return the device to available inventory
  try {
    await deviceClient.updateAvailability(loan.deviceId, 1); // Add 1 back
  } catch (error) {
    console.error('Failed to update device availability:', error);
    throw new Error('Failed to update device availability during cancellation');
  }

  // Delete the loan
  await loanRepo.delete(loanId);

  // Publish cancellation event
  await eventPublisher.publish({
    type: 'device.reservation.cancelled',
    data: {
      loanId: loan.id,
      userId: loan.userId,
      deviceId: loan.deviceId,
      deviceModel: loan.deviceModel,
      timestamp: new Date().toISOString(),
      cancelledAt: new Date().toISOString()
    }
  });

  console.log(`Loan cancelled: ${loanId} by user ${userId}`);
}

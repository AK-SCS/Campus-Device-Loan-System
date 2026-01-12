
import { Loan } from '../domain/loan.js';
import { LoanRepo } from '../domain/loan-repo.js';
import { EventPublisher } from '../infra/fake-event-publisher.js';
import { DeviceClient } from '../infra/fake-device-client.js';

export interface CancelLoanDeps {
  loanRepo: LoanRepo;
  eventPublisher: EventPublisher;
  deviceClient: DeviceClient;
}

export async function cancelLoan(
  deps: CancelLoanDeps,
  loanId: string,
  userId: string
): Promise<void> {
  const { loanRepo, eventPublisher, deviceClient } = deps;

  const loan = await loanRepo.getById(loanId);
  if (!loan) {
    throw new Error(`Loan not found: ${loanId}`);
  }

  if (loan.userId !== userId) {
    throw new Error('You can only cancel your own reservations');
  }

  if (loan.status !== 'reserved') {
    throw new Error('Only reserved loans can be cancelled. This loan has already been collected or returned.');
  }

  try {
    await deviceClient.updateAvailability(loan.deviceId, 1); 
  } catch (error) {
    console.error('Failed to update device availability:', error);
    throw new Error('Failed to update device availability during cancellation');
  }

  await loanRepo.delete(loanId);

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


import { createLoan } from '../domain/loan';
import { LoanRepo } from '../domain/loan-repo';
import { DeviceClient } from '../infra/fake-device-client';
import { EventPublisher } from '../infra/fake-event-publisher';

export interface ReserveDeviceDeps {
  loanRepo: LoanRepo;
  deviceClient: DeviceClient;
  eventPublisher: EventPublisher;
}

export interface ReserveDeviceInput {
  userId: string;
  deviceId: string;
}

export interface ReserveDeviceOutput {
  loanId: string;
  deviceModel: string;
  dueDate: Date;
}

export async function reserveDevice(
  deps: ReserveDeviceDeps,
  input: ReserveDeviceInput
): Promise<ReserveDeviceOutput> {
  const { loanRepo, deviceClient, eventPublisher } = deps;
  const { userId, deviceId } = input;

  if (!userId || userId.trim() === '') {
    throw new Error('User ID is required');
  }

  if (!deviceId || deviceId.trim() === '') {
    throw new Error('Device ID is required');
  }

  const device = await deviceClient.getDevice(deviceId);
  if (!device) {
    throw new Error('Device not found');
  }

  const isAvailable = await deviceClient.isAvailable(deviceId);
  if (!isAvailable) {
    throw new Error('Device is not available for reservation');
  }

  const existingLoans = await loanRepo.getByDeviceId(deviceId);
  const activeLoan = existingLoans.find(
    loan => loan.status === 'reserved' || loan.status === 'collected'
  );

  if (activeLoan) {
    throw new Error('Device is already reserved or on loan');
  }

  const loan = createLoan({
    userId: userId.trim(),
    deviceId: deviceId.trim(),
    deviceModel: `${device.brand} ${device.model}`
  });

  await loanRepo.save(loan);

  try {
    await deviceClient.updateAvailability(deviceId, -1);
  } catch (error) {
    console.error('Failed to update device availability:', error);

  }

  await eventPublisher.publish({
    type: 'device.reserved',
    data: {
      loanId: loan.id,
      userId: loan.userId,
      deviceId: loan.deviceId,
      deviceModel: loan.deviceModel,
      timestamp: loan.reservedAt,
      dueDate: loan.dueDate
    }
  });

  return {
    loanId: loan.id,
    deviceModel: loan.deviceModel,
    dueDate: loan.dueDate
  };
}

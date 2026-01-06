/**
 * Notification Domain Entity
 * Stores user notifications for device events (collected, returned, available)
 */

export interface Notification {
  id: string;
  userId: string;
  type: 'device.collected' | 'device.returned' | 'device.available' | 'device.reserved' | 'device.cancelled';
  title: string;
  message: string;
  loanId?: string;
  deviceId?: string;
  deviceBrand?: string;
  deviceModel?: string;
  createdAt: string;
  read: boolean;
}

export interface CreateNotificationInput {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  loanId?: string;
  deviceId?: string;
  deviceBrand?: string;
  deviceModel?: string;
}

export function createNotification(input: CreateNotificationInput): Notification {
  return {
    id: crypto.randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
    read: false
  };
}

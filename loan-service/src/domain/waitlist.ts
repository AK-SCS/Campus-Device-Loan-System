/**
 * Waitlist Domain Entity
 */

export interface Waitlist {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  deviceId: string;
  deviceBrand: string;
  deviceModel: string;
  joinedAt: string;
  notified: boolean;
  notifiedAt?: string;
}

export interface CreateWaitlistInput {
  userId: string;
  userEmail: string;
  userName: string;
  deviceId: string;
  deviceBrand: string;
  deviceModel: string;
}

export function createWaitlistEntry(input: CreateWaitlistInput): Waitlist {
  return {
    id: crypto.randomUUID(),
    userId: input.userId,
    userEmail: input.userEmail,
    userName: input.userName,
    deviceId: input.deviceId,
    deviceBrand: input.deviceBrand,
    deviceModel: input.deviceModel,
    joinedAt: new Date().toISOString(),
    notified: false
  };
}

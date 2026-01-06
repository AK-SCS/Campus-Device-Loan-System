/**
 * Waitlist Repository Interface
 */

import { Waitlist } from './waitlist.js';

export interface WaitlistRepo {
  /**
   * Save a waitlist entry
   */
  save(waitlist: Waitlist): Promise<Waitlist>;

  /**
   * Get all waitlist entries for a device
   */
  getByDeviceId(deviceId: string): Promise<Waitlist[]>;

  /**
   * Get all waitlist entries for a user
   */
  getByUserId(userId: string): Promise<Waitlist[]>;

  /**
   * Get all unnotified waitlist entries for a device
   */
  getUnnotifiedByDeviceId(deviceId: string): Promise<Waitlist[]>;

  /**
   * Delete a waitlist entry
   */
  delete(id: string): Promise<void>;
}

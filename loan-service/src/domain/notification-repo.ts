/**
 * Notification Repository Interface
 */

import { Notification } from './notification.js';

export interface NotificationRepo {
  save(notification: Notification): Promise<Notification>;
  getByUserId(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  delete(id: string): Promise<void>;
}

/**
 * Fake Notification Repository (In-Memory)
 * For local development and testing
 */

import { Notification } from '../domain/notification.js';
import { NotificationRepo } from '../domain/notification-repo.js';

export class FakeNotificationRepo implements NotificationRepo {
  private notifications: Map<string, Notification> = new Map();

  async save(notification: Notification): Promise<Notification> {
    this.notifications.set(notification.id, notification);
    console.log(`💾 Saved notification: ${notification.type} for user ${notification.userId}`);
    return notification;
  }

  async getByUserId(userId: string): Promise<Notification[]> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return userNotifications;
  }

  async markAsRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.notifications.set(id, notification);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    for (const [id, notification] of this.notifications.entries()) {
      if (notification.userId === userId) {
        notification.read = true;
        this.notifications.set(id, notification);
      }
    }
  }

  async delete(id: string): Promise<void> {
    this.notifications.delete(id);
  }
}

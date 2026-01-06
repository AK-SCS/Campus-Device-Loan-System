/**
 * In-Memory Waitlist Repository (for testing)
 */

import { Waitlist } from '../domain/waitlist.js';
import { WaitlistRepo } from '../domain/waitlist-repo.js';

export class FakeWaitlistRepo implements WaitlistRepo {
  private waitlists: Map<string, Waitlist> = new Map();

  async save(waitlist: Waitlist): Promise<Waitlist> {
    this.waitlists.set(waitlist.id, waitlist);
    return waitlist;
  }

  async getByDeviceId(deviceId: string): Promise<Waitlist[]> {
    return Array.from(this.waitlists.values())
      .filter(w => w.deviceId === deviceId)
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
  }

  async getByUserId(userId: string): Promise<Waitlist[]> {
    return Array.from(this.waitlists.values())
      .filter(w => w.userId === userId)
      .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
  }

  async getUnnotifiedByDeviceId(deviceId: string): Promise<Waitlist[]> {
    return Array.from(this.waitlists.values())
      .filter(w => w.deviceId === deviceId && !w.notified)
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
  }

  async delete(id: string): Promise<void> {
    this.waitlists.delete(id);
  }
}

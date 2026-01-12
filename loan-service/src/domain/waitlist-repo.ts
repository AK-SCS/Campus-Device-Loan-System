
import { Waitlist } from './waitlist.js';

export interface WaitlistRepo {

  save(waitlist: Waitlist): Promise<Waitlist>;

  getByDeviceId(deviceId: string): Promise<Waitlist[]>;

  getByUserId(userId: string): Promise<Waitlist[]>;

  getUnnotifiedByDeviceId(deviceId: string): Promise<Waitlist[]>;

  delete(id: string): Promise<void>;
}

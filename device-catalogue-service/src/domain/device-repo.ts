
import { Device } from './device.js';

export interface DeviceRepo {

  list(): Promise<Device[]>;

  getById(id: string): Promise<Device | null>;

  save(device: Device): Promise<Device>;

  delete(id: string): Promise<void>;
}

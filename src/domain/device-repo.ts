import { Device } from './device.js';

export interface DeviceRepo {
  create(device: Device): Promise<Device>;
  get(id: string): Promise<Device | null>;
  list(): Promise<Device[]>;
}

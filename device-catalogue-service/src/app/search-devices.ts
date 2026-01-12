
import { Device } from '../domain/device.js';
import { DeviceRepo } from '../domain/device-repo.js';

export interface SearchCriteria {
  category?: 'laptop' | 'tablet' | 'camera' | 'other';
  availableOnly?: boolean;
  minAvailability?: number;
}

export async function searchDevices(
  repo: DeviceRepo,
  criteria: SearchCriteria
): Promise<Device[]> {

  const allDevices = await repo.list();

  let results = allDevices;

  if (criteria.category) {
    results = results.filter(d => d.category === criteria.category);
  }

  if (criteria.availableOnly) {
    results = results.filter(d => d.availableCount > 0);
  }

  if (criteria.minAvailability !== undefined) {
    results = results.filter(d => d.availableCount >= criteria.minAvailability);
  }

  return results;
}

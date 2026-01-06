/**
 * Search Devices Use Case
 * Filters devices by category and/or availability
 */

import { Device } from '../domain/device.js';
import { DeviceRepo } from '../domain/device-repo.js';

export interface SearchCriteria {
  category?: 'laptop' | 'tablet' | 'camera' | 'other';
  availableOnly?: boolean;
  minAvailability?: number;
}

/**
 * Search devices based on criteria
 * @param repo - Device repository
 * @param criteria - Search criteria
 * @returns Promise resolving to array of matching devices
 */
export async function searchDevices(
  repo: DeviceRepo,
  criteria: SearchCriteria
): Promise<Device[]> {
  // Get all devices first
  const allDevices = await repo.list();

  // Apply filters
  let results = allDevices;

  // Filter by category if specified
  if (criteria.category) {
    results = results.filter(d => d.category === criteria.category);
  }

  // Filter by availability
  if (criteria.availableOnly) {
    results = results.filter(d => d.availableCount > 0);
  }

  // Filter by minimum availability
  if (criteria.minAvailability !== undefined) {
    results = results.filter(d => d.availableCount >= criteria.minAvailability);
  }

  return results;
}

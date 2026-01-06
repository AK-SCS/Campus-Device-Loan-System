/**
 * Device Domain Model
 * Pure domain entity with validation - no external dependencies
 */

export interface Device {
  id: string;
  brand: string;
  model: string;
  category: 'laptop' | 'tablet' | 'camera' | 'other';
  totalCount: number;
  availableCount: number;
}

export interface CreateDeviceInput {
  brand: string;
  model: string;
  category: 'laptop' | 'tablet' | 'camera' | 'other';
  totalCount: number;
  availableCount?: number;
}

/**
 * Factory function to create a new Device with validation
 * Throws errors if validation fails
 */
export function createDevice(input: CreateDeviceInput): Device {
  // Validate required fields
  if (!input.brand || input.brand.trim().length === 0) {
    throw new Error('Device brand is required');
  }

  if (!input.model || input.model.trim().length === 0) {
    throw new Error('Device model is required');
  }

  if (!input.category) {
    throw new Error('Device category is required');
  }

  const validCategories = ['laptop', 'tablet', 'camera', 'other'];
  if (!validCategories.includes(input.category)) {
    throw new Error('Invalid device category. Must be: laptop, tablet, camera, or other');
  }

  if (typeof input.totalCount !== 'number' || input.totalCount < 0) {
    throw new Error('Total count must be a non-negative number');
  }

  // Default availableCount to totalCount if not provided
  const availableCount = input.availableCount !== undefined 
    ? input.availableCount 
    : input.totalCount;

  if (typeof availableCount !== 'number' || availableCount < 0) {
    throw new Error('Available count must be a non-negative number');
  }

  if (availableCount > input.totalCount) {
    throw new Error('Available count cannot exceed total count');
  }

  // Generate a simple ID (in real implementation, this would come from the database)
  const id = `${input.brand.toLowerCase()}-${input.model.toLowerCase()}-${Date.now()}`;

  return {
    id,
    brand: input.brand.trim(),
    model: input.model.trim(),
    category: input.category,
    totalCount: input.totalCount,
    availableCount,
  };
}

/**
 * Update device availability (e.g., when device is reserved or returned)
 */
export function updateAvailability(device: Device, change: number): Device {
  const newAvailableCount = device.availableCount + change;

  if (newAvailableCount < 0) {
    throw new Error('Not enough devices available');
  }

  if (newAvailableCount > device.totalCount) {
    throw new Error('Available count cannot exceed total count');
  }

  return {
    ...device,
    availableCount: newAvailableCount,
  };
}

/**
 * Check if device is available for reservation
 */
export function isAvailable(device: Device): boolean {
  return device.availableCount > 0;
}

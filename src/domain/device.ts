export type Device = {
  id: string;
  brand: string;
  model: string;
  category: string;
  totalCount: number;
  availableCount: number;
};

export type CreateDeviceParams = {
  id: string;
  brand: string;
  model: string;
  category: string;
  totalCount: number;
  availableCount?: number;
};

export function createDevice(params: CreateDeviceParams): Device {
  if (!params.id || params.id.trim() === '') {
    throw new Error('Device id is required');
  }
  if (!params.brand || params.brand.trim() === '') {
    throw new Error('Device brand is required');
  }
  if (!params.model || params.model.trim() === '') {
    throw new Error('Device model is required');
  }
  if (!params.category || params.category.trim() === '') {
    throw new Error('Device category is required');
  }
  if (params.totalCount < 0) {
    throw new Error('Total count cannot be negative');
  }
  
  const availableCount = params.availableCount ?? params.totalCount;
  
  if (availableCount < 0 || availableCount > params.totalCount) {
    throw new Error('Available count must be between 0 and total count');
  }

  return {
    id: params.id,
    brand: params.brand,
    model: params.model,
    category: params.category,
    totalCount: params.totalCount,
    availableCount: availableCount,
  };
}

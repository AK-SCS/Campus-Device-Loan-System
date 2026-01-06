/**
 * Fake Device Client
 * 
 * Makes HTTP calls to Device Catalogue Service (localhost:7071).
 * In production, this will use Azure service-to-service authentication.
 */

export interface Device {
  id: string;
  brand: string;
  model: string;
  category: string;
  totalCount: number;
  availableCount: number;
}

export interface DeviceClient {
  getDevice(deviceId: string): Promise<Device | null>;
  isAvailable(deviceId: string): Promise<boolean>;
  updateAvailability(deviceId: string, change: number): Promise<void>;
}

export class FakeDeviceClient implements DeviceClient {
  private baseUrl: string;
  private functionKey?: string;

  constructor(baseUrl: string = 'http://localhost:7071/api', functionKey?: string) {
    this.baseUrl = baseUrl;
    this.functionKey = functionKey;
  }

  async getDevice(deviceId: string): Promise<Device | null> {
    const url = `${this.baseUrl}/devices/${deviceId}`;
    console.log(`[FakeDeviceClient] Fetching device from: ${url}`);
    
    const headers: Record<string, string> = {};
    if (this.functionKey) {
      headers['x-functions-key'] = this.functionKey;
    }
    
    try {
      const response = await fetch(url, { headers });
      
      console.log(`[FakeDeviceClient] Response status: ${response.status}`);
      
      if (response.status === 404) {
        console.log(`[FakeDeviceClient] Device not found: ${deviceId}`);
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[FakeDeviceClient] HTTP error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to fetch device: ${response.status} ${response.statusText}`);
      }

      const device = await response.json();
      console.log(`[FakeDeviceClient] Successfully fetched device:`, device);
      return device;
    } catch (error) {
      console.error('[FakeDeviceClient] Error fetching device:', error);
      if (error instanceof Error) {
        console.error('[FakeDeviceClient] Error details:', error.message, error.stack);
      }
      throw new Error(`Failed to fetch device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isAvailable(deviceId: string): Promise<boolean> {
    const device = await this.getDevice(deviceId);
    
    if (!device) {
      return false;
    }

    return device.availableCount > 0;
  }

  async updateAvailability(deviceId: string, change: number): Promise<void> {
    const url = `${this.baseUrl}/devices/${deviceId}/update-availability`;
    console.log(`[FakeDeviceClient] Updating availability: ${url}, change: ${change}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.functionKey) {
      headers['x-functions-key'] = this.functionKey;
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ decrementBy: -change }) // Convert to positive for decrement
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[FakeDeviceClient] Failed to update availability: ${response.status} - ${errorText}`);
        throw new Error(`Failed to update device availability: ${response.status}`);
      }

      console.log(`[FakeDeviceClient] Successfully updated availability for device ${deviceId}`);
    } catch (error) {
      console.error('[FakeDeviceClient] Error updating availability:', error);
      throw new Error(`Failed to update device availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Helper method to change base URL (for testing)
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}

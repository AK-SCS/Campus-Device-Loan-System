import { DeviceRepository } from '../application/deviceRepository';
import { DeviceModel } from '../domain/deviceModel';

export class FakeDeviceRepository implements DeviceRepository {
    async listDeviceModels(): Promise<DeviceModel[]> {
        return [
            { id: "d1", brand: "Dell", model: "Latitude 5420", category: "Laptop", available: 5 },
            { id: "d2", brand: "Apple", model: "iPad Air", category: "Tablet", available: 2 },
            { id: "d3", brand: "Canon", model: "EOS 250D", category: "Camera", available: 1 }
        ];
    }
}

import { listDevices } from '../application/listDevices';
import { FakeDeviceRepository } from '../infrastructure/fakeDeviceRepository';

describe('listDevices use-case', () => {
    it('should return an array of devices', async () => {
        // Arrange
        const fakeRepo = new FakeDeviceRepository();

        // Act
        const result = await listDevices(fakeRepo);

        // Assert
        expect(result).toBeInstanceOf(Array);
    });

    it('should return a non-empty array', async () => {
        // Arrange
        const fakeRepo = new FakeDeviceRepository();

        // Act
        const result = await listDevices(fakeRepo);

        // Assert
        expect(result.length).toBeGreaterThan(0);
    });

    it('should return devices with id and model properties', async () => {
        // Arrange
        const fakeRepo = new FakeDeviceRepository();

        // Act
        const result = await listDevices(fakeRepo);

        // Assert
        result.forEach(device => {
            expect(device).toHaveProperty('id');
            expect(device).toHaveProperty('model');
            expect(typeof device.id).toBe('string');
            expect(typeof device.model).toBe('string');
        });
    });
});

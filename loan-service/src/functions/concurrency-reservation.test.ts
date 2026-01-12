import { describe, it, expect, beforeAll } from 'vitest';

const LOAN_SERVICE_URL = process.env.LOAN_SERVICE_URL || 'https://campus-loan-service.azurewebsites.net/api';
const TEST_DEVICE_ID = 'test-device-concurrent';
const TEST_USER_1 = 'user1@test.com';
const TEST_USER_2 = 'user2@test.com';

describe('Concurrent Device Reservation Tests', () => {
  beforeAll(() => {
    if (!process.env.LOAN_SERVICE_URL) {
      console.warn('LOAN_SERVICE_URL not set, using localhost. Set it to test against deployed service.');
    }
  });

  it('should handle concurrent reservations correctly - only one should succeed', async () => {

    const reservation1Promise = fetch(`${LOAN_SERVICE_URL}/reserve-device`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: TEST_DEVICE_ID,
        userId: TEST_USER_1,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    });

    const reservation2Promise = fetch(`${LOAN_SERVICE_URL}/reserve-device`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: TEST_DEVICE_ID,
        userId: TEST_USER_2,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    });

    const [response1, response2] = await Promise.all([
      reservation1Promise,
      reservation2Promise
    ]);

    const result1 = await response1.json();
    const result2 = await response2.json();

    const successes = [
      response1.status === 200 || response1.status === 201,
      response2.status === 200 || response2.status === 201
    ].filter(Boolean).length;

    const failures = [
      response1.status === 409 || response1.status === 400,
      response2.status === 409 || response2.status === 400
    ].filter(Boolean).length;

    expect(successes).toBe(1); 
    expect(failures).toBe(1);  

    console.log('Concurrent reservation results:');
    console.log(`User 1 (${TEST_USER_1}): ${response1.status} - ${JSON.stringify(result1)}`);
    console.log(`User 2 (${TEST_USER_2}): ${response2.status} - ${JSON.stringify(result2)}`);
  }, 30000);

  it('should prevent double-booking with rapid sequential requests', async () => {
    const testDeviceId = 'test-device-sequential';

    const response1 = await fetch(`${LOAN_SERVICE_URL}/reserve-device`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: testDeviceId,
        userId: TEST_USER_1,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    });

    const response2 = await fetch(`${LOAN_SERVICE_URL}/reserve-device`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: testDeviceId,
        userId: TEST_USER_2,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    });

    expect([200, 201]).toContain(response1.status);
    expect([400, 409]).toContain(response2.status);

    const result2 = await response2.json();
    expect(result2.error || result2.message).toBeTruthy();
  }, 30000);

  it('should handle concurrent reservations for different devices correctly', async () => {

    const device1Id = 'test-device-diff-1';
    const device2Id = 'test-device-diff-2';

    const reservation1Promise = fetch(`${LOAN_SERVICE_URL}/reserve-device`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: device1Id,
        userId: TEST_USER_1,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    });

    const reservation2Promise = fetch(`${LOAN_SERVICE_URL}/reserve-device`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: device2Id,
        userId: TEST_USER_2,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    });

    const [response1, response2] = await Promise.all([
      reservation1Promise,
      reservation2Promise
    ]);

    expect([200, 201]).toContain(response1.status);
    expect([200, 201]).toContain(response2.status);
  }, 30000);
});

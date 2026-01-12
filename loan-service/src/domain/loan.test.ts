
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  createLoan,
  calculateDueDate,
  collectLoan,
  returnLoan,
  isOverdue,
  checkAndUpdateOverdue,
  Loan,
} from './loan';

describe('Loan Domain', () => {
  describe('calculateDueDate', () => {
    it('should add 2 days to reservation date', () => {
      const reservedAt = new Date('2026-01-04T10:00:00Z');
      const dueDate = calculateDueDate(reservedAt);

      expect(dueDate.getDate()).toBe(6); 
      expect(dueDate.getHours()).toBe(reservedAt.getHours());
    });

    it('should handle month boundaries', () => {
      const reservedAt = new Date('2026-01-30T10:00:00Z');
      const dueDate = calculateDueDate(reservedAt);

      expect(dueDate.getMonth()).toBe(1); 
      expect(dueDate.getDate()).toBe(1); 
    });

    it('should handle year boundaries', () => {
      const reservedAt = new Date('2025-12-30T10:00:00Z');
      const dueDate = calculateDueDate(reservedAt);

      expect(dueDate.getFullYear()).toBe(2026);
      expect(dueDate.getMonth()).toBe(0); 
      expect(dueDate.getDate()).toBe(1); 
    });
  });

  describe('createLoan', () => {
    it('should create a valid loan with all required fields', () => {
      const loan = createLoan({
        userId: 'user-123',
        deviceId: 'device-456',
        deviceModel: 'Dell XPS 15',
      });

      expect(loan.id).toBeDefined();
      expect(loan.userId).toBe('user-123');
      expect(loan.deviceId).toBe('device-456');
      expect(loan.deviceModel).toBe('Dell XPS 15');
      expect(loan.status).toBe('reserved');
      expect(loan.reservedAt).toBeInstanceOf(Date);
      expect(loan.collectedAt).toBeNull();
      expect(loan.returnedAt).toBeNull();
      expect(loan.dueDate).toBeInstanceOf(Date);
    });

    it('should set due date to 2 days after reservation', () => {
      const beforeCreate = new Date();
      const loan = createLoan({
        userId: 'user-123',
        deviceId: 'device-456',
        deviceModel: 'Test Device',
      });

      const diff = loan.dueDate.getTime() - loan.reservedAt.getTime();
      const daysDiff = diff / (1000 * 60 * 60 * 24);

      expect(daysDiff).toBeCloseTo(2, 1);
    });

    it('should trim whitespace from inputs', () => {
      const loan = createLoan({
        userId: '  user-123  ',
        deviceId: '  device-456  ',
        deviceModel: '  Dell XPS  ',
      });

      expect(loan.userId).toBe('user-123');
      expect(loan.deviceId).toBe('device-456');
      expect(loan.deviceModel).toBe('Dell XPS');
    });

    it('should throw error if userId is empty', () => {
      expect(() =>
        createLoan({
          userId: '',
          deviceId: 'device-456',
          deviceModel: 'Test',
        })
      ).toThrow('User ID is required');
    });

    it('should throw error if deviceId is empty', () => {
      expect(() =>
        createLoan({
          userId: 'user-123',
          deviceId: '   ',
          deviceModel: 'Test',
        })
      ).toThrow('Device ID is required');
    });

    it('should throw error if deviceModel is empty', () => {
      expect(() =>
        createLoan({
          userId: 'user-123',
          deviceId: 'device-456',
          deviceModel: '',
        })
      ).toThrow('Device model is required');
    });

    it('should generate unique IDs for different loans', () => {
      const loan1 = createLoan({
        userId: 'user-1',
        deviceId: 'device-1',
        deviceModel: 'Model 1',
      });

      const loan2 = createLoan({
        userId: 'user-2',
        deviceId: 'device-2',
        deviceModel: 'Model 2',
      });

      expect(loan1.id).not.toBe(loan2.id);
    });
  });

  describe('collectLoan', () => {
    let reservedLoan: Loan;

    beforeEach(() => {
      reservedLoan = createLoan({
        userId: 'user-123',
        deviceId: 'device-456',
        deviceModel: 'Test Device',
      });
    });

    it('should mark loan as collected', () => {
      const collected = collectLoan(reservedLoan);

      expect(collected.status).toBe('collected');
      expect(collected.collectedAt).toBeInstanceOf(Date);
    });

    it('should not mutate original loan', () => {
      const originalStatus = reservedLoan.status;
      collectLoan(reservedLoan);

      expect(reservedLoan.status).toBe(originalStatus);
      expect(reservedLoan.collectedAt).toBeNull();
    });

    it('should throw error if loan is not reserved', () => {
      const collectedLoan = { ...reservedLoan, status: 'collected' as const };

      expect(() => collectLoan(collectedLoan)).toThrow(
        'Only reserved loans can be collected'
      );
    });

    it('should throw error if loan already collected', () => {
      const alreadyCollected = {
        ...reservedLoan,
        collectedAt: new Date(),
      };

      expect(() => collectLoan(alreadyCollected)).toThrow(
        'Loan has already been collected'
      );
    });
  });

  describe('returnLoan', () => {
    let collectedLoan: Loan;

    beforeEach(() => {
      const reserved = createLoan({
        userId: 'user-123',
        deviceId: 'device-456',
        deviceModel: 'Test Device',
      });
      collectedLoan = collectLoan(reserved);
    });

    it('should mark loan as returned', () => {
      const returned = returnLoan(collectedLoan);

      expect(returned.status).toBe('returned');
      expect(returned.returnedAt).toBeInstanceOf(Date);
    });

    it('should not mutate original loan', () => {
      const originalStatus = collectedLoan.status;
      returnLoan(collectedLoan);

      expect(collectedLoan.status).toBe(originalStatus);
      expect(collectedLoan.returnedAt).toBeNull();
    });

    it('should throw error if loan is not collected', () => {
      const reservedLoan = createLoan({
        userId: 'user-123',
        deviceId: 'device-456',
        deviceModel: 'Test',
      });

      expect(() => returnLoan(reservedLoan)).toThrow(
        'Only collected loans can be returned'
      );
    });

    it('should throw error if loan already returned', () => {
      const alreadyReturned = {
        ...collectedLoan,
        returnedAt: new Date(),
      };

      expect(() => returnLoan(alreadyReturned)).toThrow(
        'Loan has already been returned'
      );
    });
  });

  describe('isOverdue', () => {
    it('should return false for loans not yet due', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const loan: Loan = {
        id: 'loan-1',
        userId: 'user-1',
        deviceId: 'device-1',
        deviceModel: 'Test',
        reservedAt: new Date(),
        collectedAt: new Date(),
        returnedAt: null,
        dueDate: futureDate,
        status: 'collected',
      };

      expect(isOverdue(loan)).toBe(false);
    });

    it('should return true for loans past due date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const loan: Loan = {
        id: 'loan-1',
        userId: 'user-1',
        deviceId: 'device-1',
        deviceModel: 'Test',
        reservedAt: new Date(),
        collectedAt: new Date(),
        returnedAt: null,
        dueDate: pastDate,
        status: 'collected',
      };

      expect(isOverdue(loan)).toBe(true);
    });

    it('should return false for returned loans', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const loan: Loan = {
        id: 'loan-1',
        userId: 'user-1',
        deviceId: 'device-1',
        deviceModel: 'Test',
        reservedAt: new Date(),
        collectedAt: new Date(),
        returnedAt: new Date(),
        dueDate: pastDate,
        status: 'returned',
      };

      expect(isOverdue(loan)).toBe(false);
    });
  });

  describe('checkAndUpdateOverdue', () => {
    it('should update status to overdue if past due date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const loan: Loan = {
        id: 'loan-1',
        userId: 'user-1',
        deviceId: 'device-1',
        deviceModel: 'Test',
        reservedAt: new Date(),
        collectedAt: new Date(),
        returnedAt: null,
        dueDate: pastDate,
        status: 'collected',
      };

      const updated = checkAndUpdateOverdue(loan);

      expect(updated.status).toBe('overdue');
    });

    it('should not update if not overdue', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const loan: Loan = {
        id: 'loan-1',
        userId: 'user-1',
        deviceId: 'device-1',
        deviceModel: 'Test',
        reservedAt: new Date(),
        collectedAt: null,
        returnedAt: null,
        dueDate: futureDate,
        status: 'reserved',
      };

      const updated = checkAndUpdateOverdue(loan);

      expect(updated.status).toBe('reserved');
    });

    it('should not update returned loans', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const loan: Loan = {
        id: 'loan-1',
        userId: 'user-1',
        deviceId: 'device-1',
        deviceModel: 'Test',
        reservedAt: new Date(),
        collectedAt: new Date(),
        returnedAt: new Date(),
        dueDate: pastDate,
        status: 'returned',
      };

      const updated = checkAndUpdateOverdue(loan);

      expect(updated.status).toBe('returned');
    });
  });
});

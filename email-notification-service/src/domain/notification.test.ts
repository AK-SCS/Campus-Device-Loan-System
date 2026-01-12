
import { describe, it, expect } from 'vitest';
import {
  reservationConfirmation,
  collectionConfirmation,
  returnConfirmation,
  deviceAvailableNotification,
  cancellationConfirmation,
  overdueReminder,
} from './notification';

describe('Email Templates', () => {
  describe('reservationConfirmation', () => {
    it('should generate reservation confirmation email', () => {
      const email = reservationConfirmation({
        loanId: 'loan-123',
        userId: 'user@example.com',
        deviceId: 'device-1',
        deviceModel: 'Dell XPS 15',
        reservedAt: new Date('2026-01-04T10:00:00Z'),
        dueDate: new Date('2026-01-06T10:00:00Z'),
      });

      expect(email.subject).toContain('Reserved');
      expect(email.body).toContain('Dell XPS 15');
      expect(email.body).toContain('loan-123');
      expect(email.body).toContain('2-day');
    });

    it('should include all required information', () => {
      const email = reservationConfirmation({
        loanId: 'loan-456',
        userId: 'test@test.com',
        deviceId: 'device-2',
        deviceModel: 'iPad Air',
        reservedAt: new Date(),
        dueDate: new Date(),
      });

      expect(email.subject).toBeTruthy();
      expect(email.body).toContain('loan-456');
      expect(email.body).toContain('iPad Air');
    });
  });

  describe('collectionConfirmation', () => {
    it('should generate collection confirmation email', () => {
      const email = collectionConfirmation({
        loanId: 'loan-123',
        userId: 'user@example.com',
        deviceModel: 'Dell XPS 15',
        collectedAt: new Date('2026-01-04T14:00:00Z'),
        dueDate: new Date('2026-01-06T14:00:00Z'),
      });

      expect(email.subject).toContain('Device Collected');
      expect(email.body).toContain('Dell XPS 15');
      expect(email.body).toContain('loan-123');
    });

    it('should include due date information', () => {
      const dueDate = new Date('2026-01-08T10:00:00Z');
      const email = collectionConfirmation({
        loanId: 'loan-789',
        userId: 'user@test.com',
        deviceModel: 'MacBook Pro',
        collectedAt: new Date(),
        dueDate,
      });

      expect(email.body).toContain('Thursday, 8 January');
    });
  });

  describe('returnConfirmation', () => {
    it('should generate return confirmation email', () => {
      const email = returnConfirmation({
        loanId: 'loan-123',
        userId: 'user@example.com',
        deviceModel: 'Dell XPS 15',
        returnedAt: new Date('2026-01-05T16:00:00Z'),
      });

      expect(email.subject).toContain('Device Returned');
      expect(email.body).toContain('Dell XPS 15');
      expect(email.body).toContain('loan-123');
    });

    it('should thank user for returning device', () => {
      const email = returnConfirmation({
        loanId: 'loan-456',
        userId: 'test@test.com',
        deviceModel: 'Canon EOS R6',
        returnedAt: new Date(),
      });

      expect(email.body.toLowerCase()).toContain('thank');
    });
  });

  describe('deviceAvailableNotification', () => {
    it('should generate device available notification', () => {
      const email = deviceAvailableNotification({
        deviceId: 'device-1',
        deviceModel: 'Dell XPS 15',
        userId: 'user@example.com',
      });

      expect(email.subject).toContain('Now Available');
      expect(email.body).toContain('Dell XPS 15');
    });

    it('should include device information', () => {
      const email = deviceAvailableNotification({
        deviceId: 'device-5',
        deviceModel: 'iPad Pro',
        userId: 'test@test.com',
      });

      expect(email.body).toContain('iPad Pro');
      expect(email.body).toContain('available');
    });
  });

  describe('cancellationConfirmation', () => {
    it('should generate cancellation confirmation email', () => {
      const email = cancellationConfirmation({
        loanId: 'loan-123',
        userId: 'user@example.com',
        deviceModel: 'Dell XPS 15',
        cancelledAt: new Date('2026-01-04T11:00:00Z'),
      });

      expect(email.subject).toContain('Reservation Cancelled');
      expect(email.body).toContain('Dell XPS 15');
      expect(email.body).toContain('loan-123');
    });

    it('should confirm cancellation', () => {
      const email = cancellationConfirmation({
        loanId: 'loan-789',
        userId: 'test@test.com',
        deviceModel: 'Surface Pro',
        cancelledAt: new Date(),
      });

      expect(email.body.toLowerCase()).toContain('cancel');
    });
  });

  describe('overdueReminder', () => {
    it('should generate overdue reminder email', () => {
      const email = overdueReminder({
        loanId: 'loan-123',
        userId: 'user@example.com',
        deviceModel: 'Dell XPS 15',
        dueDate: new Date('2026-01-02T10:00:00Z'),
        daysOverdue: 3,
      });

      expect(email.subject).toContain('Overdue');
      expect(email.body).toContain('Dell XPS 15');
      expect(email.body).toContain('loan-123');
      expect(email.body).toContain('3');
    });

    it('should indicate urgency', () => {
      const email = overdueReminder({
        loanId: 'loan-456',
        userId: 'test@test.com',
        deviceModel: 'iPad',
        dueDate: new Date(),
        daysOverdue: 5,
      });

      expect(email.subject.toLowerCase()).toContain('overdue');
      expect(email.body).toContain('5');
    });

    it('should work for 1 day overdue', () => {
      const email = overdueReminder({
        loanId: 'loan-789',
        userId: 'test@test.com',
        deviceModel: 'Camera',
        dueDate: new Date(),
        daysOverdue: 1,
      });

      expect(email.body).toContain('1');
    });
  });
});

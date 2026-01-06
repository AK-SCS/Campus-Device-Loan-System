/**
 * Fake Loan Repository
 * 
 * In-memory implementation for local development.
 * Starts with an empty array - loans are created through reservations.
 */

import { Loan } from '../domain/loan';
import { LoanRepo } from '../domain/loan-repo';

export class FakeLoanRepo implements LoanRepo {
  private loans: Loan[] = [];

  async list(): Promise<Loan[]> {
    // Return copies to prevent external modifications
    return this.loans.map(loan => ({ ...loan }));
  }

  async getById(id: string): Promise<Loan | null> {
    const loan = this.loans.find(l => l.id === id);
    return loan ? { ...loan } : null;
  }

  async getByUserId(userId: string): Promise<Loan[]> {
    return this.loans
      .filter(l => l.userId === userId)
      .map(loan => ({ ...loan }));
  }

  async getByDeviceId(deviceId: string): Promise<Loan[]> {
    return this.loans
      .filter(l => l.deviceId === deviceId)
      .map(loan => ({ ...loan }));
  }

  async save(loan: Loan): Promise<Loan> {
    const existingIndex = this.loans.findIndex(l => l.id === loan.id);
    
    if (existingIndex >= 0) {
      // Update existing loan
      this.loans[existingIndex] = { ...loan };
    } else {
      // Add new loan
      this.loans.push({ ...loan });
    }
    
    return { ...loan };
  }

  async delete(id: string): Promise<void> {
    this.loans = this.loans.filter(l => l.id !== id);
  }

  /**
   * Helper method for testing - reset to empty state
   */
  reset(): void {
    this.loans = [];
  }

  /**
   * Helper method for testing - seed with sample loans
   */
  seed(loans: Loan[]): void {
    this.loans = loans.map(loan => ({ ...loan }));
  }
}

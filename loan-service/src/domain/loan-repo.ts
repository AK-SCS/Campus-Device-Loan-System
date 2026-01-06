/**
 * Loan Repository Interface
 * 
 * Port for loan persistence operations.
 * Implementations can be fake (in-memory) or real (Cosmos DB).
 */

import { Loan } from './loan';

export interface LoanRepo {
  /**
   * List all loans
   */
  list(): Promise<Loan[]>;

  /**
   * Get loan by ID
   */
  getById(id: string): Promise<Loan | null>;

  /**
   * Get all loans for a specific user
   */
  getByUserId(userId: string): Promise<Loan[]>;

  /**
   * Get all loans for a specific device
   */
  getByDeviceId(deviceId: string): Promise<Loan[]>;

  /**
   * Save (create or update) a loan
   */
  save(loan: Loan): Promise<Loan>;

  /**
   * Delete a loan by ID
   */
  delete(id: string): Promise<void>;
}

/**
 * Loan Domain Model
 * 
 * Represents a device loan with reservation, collection, and return lifecycle.
 * Enforces the 2-day loan period business rule.
 */

export type LoanStatus = 'reserved' | 'collected' | 'returned' | 'overdue';

export interface Loan {
  id: string;
  userId: string;
  deviceId: string;
  deviceModel: string; // Store device model for display purposes
  reservedAt: Date;
  collectedAt: Date | null;
  returnedAt: Date | null;
  dueDate: Date;
  status: LoanStatus;
}

export interface CreateLoanInput {
  userId: string;
  deviceId: string;
  deviceModel: string;
}

/**
 * Calculate due date: 2 days from reservation time
 */
export function calculateDueDate(reservedAt: Date): Date {
  const dueDate = new Date(reservedAt);
  dueDate.setDate(dueDate.getDate() + 2); // Add 2 days
  return dueDate;
}

/**
 * Create a new loan with validation
 */
export function createLoan(input: CreateLoanInput): Loan {
  // Validate userId
  if (!input.userId || input.userId.trim() === '') {
    throw new Error('User ID is required');
  }

  // Validate deviceId
  if (!input.deviceId || input.deviceId.trim() === '') {
    throw new Error('Device ID is required');
  }

  // Validate deviceModel
  if (!input.deviceModel || input.deviceModel.trim() === '') {
    throw new Error('Device model is required');
  }

  const reservedAt = new Date();
  const dueDate = calculateDueDate(reservedAt);

  // Generate unique loan ID
  const id = `loan-${input.userId}-${input.deviceId}-${Date.now()}`;

  return {
    id,
    userId: input.userId.trim(),
    deviceId: input.deviceId.trim(),
    deviceModel: input.deviceModel.trim(),
    reservedAt,
    collectedAt: null,
    returnedAt: null,
    dueDate,
    status: 'reserved'
  };
}

/**
 * Mark loan as collected
 */
export function collectLoan(loan: Loan): Loan {
  if (loan.status !== 'reserved') {
    throw new Error('Only reserved loans can be collected');
  }

  if (loan.collectedAt !== null) {
    throw new Error('Loan has already been collected');
  }

  return {
    ...loan,
    collectedAt: new Date(),
    status: 'collected'
  };
}

/**
 * Mark loan as returned
 */
export function returnLoan(loan: Loan): Loan {
  if (loan.status !== 'collected') {
    throw new Error('Only collected loans can be returned');
  }

  if (loan.returnedAt !== null) {
    throw new Error('Loan has already been returned');
  }

  return {
    ...loan,
    returnedAt: new Date(),
    status: 'returned'
  };
}

/**
 * Check if loan is overdue
 */
export function isOverdue(loan: Loan): boolean {
  if (loan.status === 'returned') {
    return false; // Already returned, not overdue
  }

  const now = new Date();
  return now > loan.dueDate;
}

/**
 * Update loan status to overdue if past due date
 */
export function checkAndUpdateOverdue(loan: Loan): Loan {
  if (loan.status === 'returned') {
    return loan; // No update needed
  }

  if (isOverdue(loan)) {
    return {
      ...loan,
      status: 'overdue'
    };
  }

  return loan;
}

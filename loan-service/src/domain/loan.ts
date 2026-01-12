
export type LoanStatus = 'reserved' | 'collected' | 'returned' | 'overdue';

export interface Loan {
  id: string;
  userId: string;
  deviceId: string;
  deviceModel: string; 
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

export function calculateDueDate(reservedAt: Date): Date {
  const dueDate = new Date(reservedAt);
  dueDate.setDate(dueDate.getDate() + 2); 
  return dueDate;
}

export function createLoan(input: CreateLoanInput): Loan {

  if (!input.userId || input.userId.trim() === '') {
    throw new Error('User ID is required');
  }

  if (!input.deviceId || input.deviceId.trim() === '') {
    throw new Error('Device ID is required');
  }

  if (!input.deviceModel || input.deviceModel.trim() === '') {
    throw new Error('Device model is required');
  }

  const reservedAt = new Date();
  const dueDate = calculateDueDate(reservedAt);

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

export function isOverdue(loan: Loan): boolean {
  if (loan.status === 'returned') {
    return false; 
  }

  const now = new Date();
  return now > loan.dueDate;
}

export function checkAndUpdateOverdue(loan: Loan): Loan {
  if (loan.status === 'returned') {
    return loan; 
  }

  if (isOverdue(loan)) {
    return {
      ...loan,
      status: 'overdue'
    };
  }

  return loan;
}

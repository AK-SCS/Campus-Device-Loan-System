
import { Loan, LoanStatus, checkAndUpdateOverdue } from '../domain/loan.js';
import { LoanRepo } from '../domain/loan-repo.js';

export interface ListLoansDeps {
  loanRepo: LoanRepo;
}

export interface ListLoansInput {
  userId?: string; 
  deviceId?: string; 
  status?: LoanStatus; 
}

export async function listLoans(
  deps: ListLoansDeps,
  input?: ListLoansInput
): Promise<Loan[]> {
  const { loanRepo } = deps;

  let loans: Loan[];

  if (input?.userId) {
    loans = await loanRepo.getByUserId(input.userId);
  } else if (input?.deviceId) {
    loans = await loanRepo.getByDeviceId(input.deviceId);
  } else {
    loans = await loanRepo.list();
  }

  loans = loans.map(loan => checkAndUpdateOverdue(loan));

  if (input?.status) {
    loans = loans.filter(loan => loan.status === input.status);
  }

  return loans;
}

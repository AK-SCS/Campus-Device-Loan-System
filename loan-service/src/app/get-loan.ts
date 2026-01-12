
import { Loan } from '../domain/loan';
import { LoanRepo } from '../domain/loan-repo';

export interface GetLoanDeps {
  loanRepo: LoanRepo;
}

export interface GetLoanInput {
  loanId: string;
}

export async function getLoan(
  deps: GetLoanDeps,
  input: GetLoanInput
): Promise<Loan | null> {
  const { loanRepo } = deps;
  const { loanId } = input;

  if (!loanId || loanId.trim() === '') {
    throw new Error('Loan ID is required');
  }

  return await loanRepo.getById(loanId);
}

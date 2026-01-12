
import { Loan, checkAndUpdateOverdue } from '../domain/loan.js';
import { LoanRepo } from '../domain/loan-repo.js';

export interface GetOverdueLoansDeps {
  loanRepo: LoanRepo;
}

export async function getOverdueLoans(
  deps: GetOverdueLoansDeps
): Promise<Loan[]> {
  const { loanRepo } = deps;

  const allLoans = await loanRepo.list();

  const overdueLoans: Loan[] = [];

  for (const loan of allLoans) {
    const updatedLoan = checkAndUpdateOverdue(loan);

    if (updatedLoan.status === 'overdue') {

      if (loan.status !== 'overdue') {
        await loanRepo.save(updatedLoan);
      }
      overdueLoans.push(updatedLoan);
    }
  }

  return overdueLoans;
}

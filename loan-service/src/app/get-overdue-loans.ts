/**
 * Get Overdue Loans Use Case
 * 
 * Retrieves all loans that are past their due date and not yet returned.
 */

import { Loan, checkAndUpdateOverdue } from '../domain/loan.js';
import { LoanRepo } from '../domain/loan-repo.js';

export interface GetOverdueLoansDeps {
  loanRepo: LoanRepo;
}

/**
 * Get all overdue loans
 * @param deps - Dependencies
 * @returns Promise resolving to array of overdue loans
 */
export async function getOverdueLoans(
  deps: GetOverdueLoansDeps
): Promise<Loan[]> {
  const { loanRepo } = deps;

  // Get all loans
  const allLoans = await loanRepo.list();

  // Filter and update overdue status
  const overdueLoans: Loan[] = [];

  for (const loan of allLoans) {
    const updatedLoan = checkAndUpdateOverdue(loan);
    
    if (updatedLoan.status === 'overdue') {
      // Save the updated status if it changed
      if (loan.status !== 'overdue') {
        await loanRepo.save(updatedLoan);
      }
      overdueLoans.push(updatedLoan);
    }
  }

  return overdueLoans;
}

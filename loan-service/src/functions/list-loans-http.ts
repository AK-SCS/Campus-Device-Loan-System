/**
 * List Loans HTTP Endpoint
 * 
 * GET /api/loans
 * Optional query parameters: userId, deviceId, status
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { listLoans } from '../app/list-loans.js';
import { LoanStatus } from '../domain/loan.js';
import { getLoanRepo } from '../config/appServices.js';

export async function listLoansHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processing request for list loans');

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return {
      status: 200,
      headers: getCorsHeaders()
    };
  }

  try {
    // Get optional query parameters
    const userId = request.query.get('userId') || undefined;
    const deviceId = request.query.get('deviceId') || undefined;
    const statusParam = request.query.get('status');
    
    // Validate status if provided
    let status: LoanStatus | undefined;
    if (statusParam) {
      const validStatuses: LoanStatus[] = ['reserved', 'collected', 'returned', 'overdue'];
      if (!validStatuses.includes(statusParam as LoanStatus)) {
        return {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
          jsonBody: {
            error: 'Invalid status. Must be: reserved, collected, returned, or overdue'
          }
        };
      }
      status = statusParam as LoanStatus;
    }

    // Call use case
    const loans = await listLoans(
      { loanRepo: getLoanRepo() },
      { userId, deviceId, status }
    );

    context.log(`Successfully retrieved ${loans.length} loans`);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      jsonBody: loans
    };

  } catch (error) {
    context.error('Error listing loans:', error);

    return {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      jsonBody: {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

app.http('listLoans', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'loans',
  handler: listLoansHttp
});





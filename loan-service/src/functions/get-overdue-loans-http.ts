/**
 * Get Overdue Loans HTTP Endpoint
 * 
 * GET /api/overdue-loans
 * Returns all loans that are past their due date
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { getOverdueLoans } from '../app/get-overdue-loans.js';
import { getLoanRepo } from '../config/appServices.js';

export async function getOverdueLoansHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processing request for overdue loans');

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return {
      status: 200,
      headers: getCorsHeaders()
    };
  }

  try {
    // Call use case
    const overdueLoans = await getOverdueLoans({
      loanRepo: getLoanRepo()
    });

    context.log(`Successfully retrieved ${overdueLoans.length} overdue loans`);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      jsonBody: overdueLoans
    };

  } catch (error) {
    context.error('Error getting overdue loans:', error);

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

app.http('getOverdueLoans', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'overdue-loans',
  handler: getOverdueLoansHttp
});




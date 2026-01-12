
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { getLoan } from '../app/get-loan';
import { getLoanRepo } from '../config/appServices';

export async function getLoanHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processing request for get loan');

  try {

    const loanId = request.params.loanId;

    if (!loanId) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
        jsonBody: {
          error: 'Loan ID is required'
        }
      };
    }

    context.log(`Retrieving loan with ID: ${loanId}`);

    const loan = await getLoan(
      { loanRepo: getLoanRepo() },
      { loanId }
    );

    if (!loan) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
        jsonBody: {
          error: 'Loan not found'
        }
      };
    }

    context.log(`Successfully retrieved loan: ${loanId}`);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      jsonBody: loan
    };

  } catch (error) {
    context.error('Error getting loan:', error);

    if (error instanceof Error && error.message.includes('required')) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
        jsonBody: {
          error: error.message
        }
      };
    }

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

app.http('getLoan', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'loans/{loanId}',
  handler: getLoanHttp
});


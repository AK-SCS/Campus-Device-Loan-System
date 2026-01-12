
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCorsHeaders } from '../utils/cors.js';
import { cancelLoan } from '../app/cancel-loan.js';
import { getLoanRepo, getEventPublisher, getDeviceClient } from '../config/appServices.js';

export async function cancelLoanHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processing request to cancel loan');

  if (request.method === 'OPTIONS') {
    return {
      status: 200,
      headers: getCorsHeaders()
    };
  }

  try {

    const loanId = request.params.id;

    if (!loanId) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
        jsonBody: {
          error: 'Loan ID is required'
        }
      };
    }

    const body = await request.json() as { userId?: string };
    const userId = body?.userId || request.query.get('userId');

    if (!userId) {
      return {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
        jsonBody: {
          error: 'User ID is required for authorization'
        }
      };
    }

    await cancelLoan(
      {
        loanRepo: getLoanRepo(),
        eventPublisher: getEventPublisher(),
        deviceClient: getDeviceClient()
      },
      loanId,
      userId
    );

    context.log(`Loan cancelled successfully: ${loanId}`);

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      jsonBody: {
        message: 'Loan cancelled successfully',
        loanId
      }
    };

  } catch (error) {
    context.error('Error cancelling loan:', error);

    const statusCode = error instanceof Error && 
                        (error.message.includes('not found') || 
                         error.message.includes('Only reserved')) 
                        ? 400 : 500;

    return {
      status: statusCode,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      jsonBody: {
        error: error instanceof Error ? error.message : 'Internal server error'
      }
    };
  }
}

app.http('cancelLoan', {
  methods: ['DELETE', 'POST', 'OPTIONS'], 
  authLevel: 'anonymous',
  route: 'loans/{id}/cancel',
  handler: cancelLoanHttp
});


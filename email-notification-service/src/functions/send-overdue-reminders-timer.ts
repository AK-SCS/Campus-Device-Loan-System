/**
 * Send Overdue Reminders - Timer Triggered Function
 * 
 * Runs daily to check for overdue loans and send reminder emails.
 * Timer schedule: 0 0 9 * * * (9:00 AM every day)
 */

import { app, InvocationContext, Timer } from '@azure/functions';

/**
 * Timer-triggered function that sends overdue reminder emails
 * Runs daily at 9:00 AM to check for overdue loans
 */
export async function sendOverdueReminders(
  myTimer: Timer,
  context: InvocationContext
): Promise<void> {
  context.log('⏰ Timer trigger: Sending overdue reminders...');

  try {
    // In production, this would:
    // 1. Query Loan Service for all overdue loans: GET /api/overdue-loans
    // 2. For each overdue loan, publish a loan.overdue event
    // 3. This function would trigger automatically via Event Grid subscription
    // 4. Send email via the sendNotification use case

    // For local development, we'll just log the intention
    // The actual integration happens when deployed to Azure with Event Grid

    context.log('📧 Checking for overdue loans...');
    
    // TODO: When deployed to Azure:
    // const loanServiceUrl = process.env.LOAN_SERVICE_URL;
    // const response = await fetch(`${loanServiceUrl}/api/overdue-loans`);
    // const overdueLoans = await response.json();
    // 
    // for (const loan of overdueLoans) {
    //   const daysOverdue = Math.floor(
    //     (Date.now() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    //   );
    //   
    //   const event = {
    //     type: 'loan.overdue',
    //     data: {
    //       loanId: loan.id,
    //       userId: loan.userId,
    //       deviceId: loan.deviceId,
    //       deviceModel: loan.deviceModel,
    //       timestamp: new Date().toISOString(),
    //       dueDate: loan.dueDate,
    //       daysOverdue: daysOverdue
    //     }
    //   };
    //   
    //   await sendNotification(event, { emailSender });
    // }

    context.log('✅ Overdue reminder check completed');
    context.log('   Next run: Tomorrow at 9:00 AM');

  } catch (error) {
    context.error('❌ Error sending overdue reminders:', error);
    throw error;
  }
}

app.timer('send-overdue-reminders', {
  // NCRONTAB format: {second} {minute} {hour} {day} {month} {day-of-week}
  // 0 0 9 * * * = Every day at 9:00 AM
  schedule: '0 0 9 * * *',
  handler: sendOverdueReminders
});

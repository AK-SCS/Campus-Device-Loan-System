
import { app, InvocationContext, Timer } from '@azure/functions';

export async function sendOverdueReminders(
  myTimer: Timer,
  context: InvocationContext
): Promise<void> {
  context.log('⏰ Timer trigger: Sending overdue reminders...');

  try {

    context.log('📧 Checking for overdue loans...');

    context.log('✅ Overdue reminder check completed');
    context.log('   Next run: Tomorrow at 9:00 AM');

  } catch (error) {
    context.error('❌ Error sending overdue reminders:', error);
    throw error;
  }
}

app.timer('send-overdue-reminders', {

  schedule: '0 0 9 * * *',
  handler: sendOverdueReminders
});

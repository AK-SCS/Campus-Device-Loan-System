# Email Notification Service

This service sends email notifications for loan events.

## Features
- Send reservation confirmation emails
- Send collection confirmation emails
- Send return confirmation emails
- Send cancellation confirmation emails (NEW)
- Send overdue reminder emails (NEW)
- Send device availability notifications to waitlisted users
- Timer-triggered daily overdue reminders (9:00 AM)

## Event Types Supported

1. **device.reserved** - Sent when a student reserves a device
   - Required fields: `reservedAt`, `dueDate`
   
2. **device.collected** - Sent when a student collects a device
   - Required fields: `collectedAt`, `dueDate`
   
3. **device.returned** - Sent when a device is returned
   - Required fields: `returnedAt`
   
4. **device.reservation.cancelled** - Sent when a reservation is cancelled
   - Required fields: `cancelledAt`
   
5. **loan.overdue** - Sent when a loan becomes overdue
   - Required fields: `dueDate`, `daysOverdue`

## Architecture
Following Ports & Adapters (Hexagonal) pattern:
- `src/domain/` - Email templates and notification models
- `src/infra/` - Email sender implementations (fake for local, SendGrid for production)
- `src/app/` - Email sending use cases
- `src/functions/` - Event triggers (HTTP for now, Event Grid later)
- `src/config/` - Dependency injection

## Local Development

### Prerequisites
- Docker Desktop running
- VS Code with Dev Containers extension

### Setup
1. Open this folder in VS Code
2. Reopen in Container when prompted
3. Run `npm install`
4. Run `npm start` (runs on port 7073)
5. Test by POSTing events to `http://localhost:7073/api/handle-loan-event`

### Using Fake Email Sender (No SendGrid needed)
By default, the service uses `fake-email-sender.ts` which logs emails to console.
Perfect for local development!

### Using Real SendGrid
Set environment variables in `local.settings.json`:
- `SENDGRID_API_KEY`
- `FROM_EMAIL`

# Azure Monitor Alert Setup Guide

This guide explains how to create Azure Monitor alerts for the Campus Device Loan System.

## Prerequisites

- Azure Function Apps deployed to Azure
- Application Insights configured and connected to each Function App
- Log Analytics workspace created and linked to Application Insights

## Alert 1: Reservation Failures

This alert triggers when device reservation operations fail more than 5 times within 5 minutes.

### Step 1: Navigate to Azure Monitor

1. Open Azure Portal: https://portal.azure.com
2. Search for "Monitor" in the top search bar
3. Click **Monitor** service

### Step 2: Create Action Group

1. In Monitor, click **Alerts** → **Action groups**
2. Click **+ Create**
3. Fill in the details:
   - **Subscription**: Select your subscription
   - **Resource group**: `campus-device-loan-rg`
   - **Action group name**: `campus-device-loan-alerts`
   - **Display name**: `Campus Alerts`
4. Click **Next: Notifications**
5. Add email notification:
   - **Notification type**: Email/SMS message/Push/Voice
   - **Name**: `Admin Email`
   - **Email**: Your email address
   - Check **Email** checkbox
6. Click **Review + create** → **Create**

### Step 3: Create Alert Rule for Reservation Failures

1. In Monitor, click **Alerts** → **Alert rules**
2. Click **+ Create** → **Alert rule**
3. **Scope**:
   - Click **Select resource**
   - Filter by **Resource type**: `Application Insights`
   - Select your Application Insights instance (e.g., `campus-loan-service-insights`)
   - Click **Done**
4. **Condition**:
   - Click **Add condition**
   - Select signal: **Custom log search**
   - Enter KQL query:
     ```kql
     AppEvents
     | where Name == "DeviceReservationFailure"
     | where TimeGenerated > ago(5m)
     | count
     ```
   - **Alert logic**:
     - **Threshold**: Static
     - **Operator**: Greater than
     - **Aggregation type**: Count
     - **Threshold value**: 5
   - **Evaluation period**:
     - **Check every**: 5 minutes
     - **Lookback period**: 5 minutes
   - Click **Done**
5. **Actions**:
   - Click **Select action group**
   - Select `campus-device-loan-alerts`
   - Click **Select**
6. **Details**:
   - **Alert rule name**: `reservation-failures-alert`
   - **Description**: `Alert when device reservations fail >5 times in 5 minutes`
   - **Severity**: Sev 2 (Warning)
   - **Enable alert rule upon creation**: Yes
7. Click **Review + create** → **Create**

## Alert 2: Email Notification Failures

This alert triggers when email notifications fail more than 3 times within 10 minutes.

### KQL Query

```kql
AppEvents
| where Name == "EmailNotificationFailure"
| where TimeGenerated > ago(10m)
| count
```

**Alert Configuration**:
- **Threshold value**: 3
- **Check every**: 5 minutes
- **Lookback period**: 10 minutes
- **Alert rule name**: `email-notification-failures-alert`
- **Severity**: Sev 3 (Informational)

## Alert 3: High Response Time

This alert triggers when API response times exceed 2 seconds on average.

### KQL Query

```kql
AppMetrics
| where Name in ("ReservationDuration", "ReturnDuration", "DeviceOperationDuration")
| where TimeGenerated > ago(5m)
| summarize AvgDuration = avg(Sum) by Name
| where AvgDuration > 2000
```

**Alert Configuration**:
- **Threshold value**: 1 (number of results)
- **Check every**: 5 minutes
- **Lookback period**: 5 minutes
- **Alert rule name**: `high-response-time-alert`
- **Severity**: Sev 2 (Warning)

## Testing the Alerts

### Test Reservation Failure Alert

1. Deploy your functions to Azure
2. Trigger multiple reservation failures by:
   - Trying to reserve a non-existent device
   - Trying to reserve a device with no availability
   - Making 6+ failed requests within 5 minutes
3. Wait 5-10 minutes for alert to trigger
4. Check your email for alert notification

### View Alert History

1. Go to **Monitor** → **Alerts** → **Alert history**
2. Filter by **Alert rule name**
3. View fired alerts and their details

## Custom Metrics Being Tracked

Our implementation tracks the following custom metrics:

### Loan Service
- **DeviceReservationSuccess** (Event): Successful device reservations
- **DeviceReservationFailure** (Event): Failed device reservations
- **ReservationDuration** (Metric): Time taken for reservation operations
- **DeviceReturnSuccess** (Event): Successful device returns
- **DeviceReturnFailure** (Event): Failed device returns
- **ReturnDuration** (Metric): Time taken for return operations

### Device Catalogue Service
- **DeviceCreated** (Event): New devices added to catalogue
- **DeviceCreationFailure** (Event): Failed device creation attempts
- **DeviceAvailabilityUpdated** (Event): Device availability updates
- **DeviceAvailabilityUpdateFailure** (Event): Failed availability updates
- **DeviceOperationDuration** (Metric): Time taken for device operations
- **AvailabilityUpdateDuration** (Metric): Time taken for availability updates

### Email Notification Service
- **EmailNotificationSuccess** (Event): Successfully sent emails
- **EmailNotificationFailure** (Event): Failed email deliveries
- **EmailNotificationError** (Event): Unexpected errors during email processing
- **EmailNotificationDuration** (Metric): Time taken to send emails

## Viewing Custom Metrics in Azure

### Via Log Analytics

1. Go to your **Log Analytics workspace**
2. Click **Logs**
3. Run queries:

**View all custom events:**
```kql
AppEvents
| where TimeGenerated > ago(24h)
| project TimeGenerated, Name, Properties
| order by TimeGenerated desc
```

**View custom metrics:**
```kql
AppMetrics
| where TimeGenerated > ago(24h)
| project TimeGenerated, Name, Sum, Properties
| order by TimeGenerated desc
```

**Trace a specific operation:**
```kql
let loanId = "your-loan-id";
union AppEvents, AppMetrics
| where TimeGenerated > ago(24h)
| where Properties contains loanId
| project TimeGenerated, Name, Properties
| order by TimeGenerated asc
```

### Via Application Insights

1. Go to your **Application Insights** resource
2. Click **Logs**
3. Use the same KQL queries as above
4. Or use **Metrics** blade to visualize metrics over time

## Evidence for ICA

For your ICA submission, include:

1. **Screenshots**:
   - Alert rule configuration page
   - Action group configuration
   - Fired alert email
   - Custom events in Log Analytics
   - Custom metrics visualization

2. **KQL Queries**:
   - Include the queries used for alerts
   - Include queries demonstrating custom telemetry

3. **Explanation**:
   - Why these specific metrics were chosen
   - How they help monitor system health
   - What actions would be taken when alerts fire

## ICA Requirements Met

✅ **Task 48**: Create at least one alert in Azure Monitor
- Alert configured for reservation failures >5 in 5 minutes
- Email notification configured via Action Group
- Additional alerts for email failures and high response times

✅ **Task 45**: Add Application Insights to All Services
- Custom telemetry logging added to critical paths
- trackEvent() used for business events
- trackMetric() used for performance metrics

✅ **Task 46**: Configure Log Analytics Workspace
- All custom events queryable via KQL
- Cross-service tracing possible via OperationId
- Resource-specific tables used for efficient querying

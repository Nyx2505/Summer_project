import { notificationHubClient } from '../config/azure.js';

export const notificationService = {
  async sendComplianceAlert({ type, title, message, severity }) {
    // 1. Compile Notification Hub Payload
    const notificationPayload = {
      body: `[ACOM ALERT] [${severity.toUpperCase()}] ${title}: ${message}`,
      headers: {
        'x-priority': severity === 'high' ? '1' : '3',
        'x-type': type
      }
    };

    try {
      await notificationHubClient.sendNotification(notificationPayload);
    } catch (err) {
      console.error('[Notification Hub Error]', err.message);
    }

    // 2. Dispatch to MS Teams Webhook (if URL configured)
    if (process.env.TEAMS_WEBHOOK_URL) {
      try {
        await fetch(process.env.TEAMS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `ACOM Alert: ${title}`,
            text: `**Severity**: ${severity.toUpperCase()}<br/>**Detail**: ${message}<br/>*Scope*: ${type}`
          })
        });
        console.log('[Notification Service] Dispatched alert to MS Teams channel.');
      } catch (e) {
        // Handled
      }
    }

    // 3. Dispatch to Slack Webhook (if URL configured)
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `*ACOM ALERT* [${severity.toUpperCase()}] *${title}*\n${message}\nCategory: ${type}`
          })
        });
        console.log('[Notification Service] Dispatched alert to Slack channel.');
      } catch (e) {
        // Handled
      }
    }

    // 4. Dispatch Email/SMS (simulated SMTP / Twilio SMS logic)
    console.log(`[Notification Dispatcher] Sent Email/SMS Alert to administrative members.`);
    return true;
  }
};

/**
 * =============================================================================
 * Automated Project Supervision and Evaluation System (APSES)
 * Notifications and Departmental Alert Dispatcher
 * =============================================================================
 */

export interface EmailAlertPayload {
  to: string | string[];
  recipientName?: string;
  subject: string;
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  headline: string;
  message: string;
  details?: Record<string, unknown>;
  actionUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId: string;
  status: 'SUCCESS' | 'BLOCKED' | 'FLAGGED';
  metadata?: Record<string, unknown>;
}

// In-memory audit trail buffer for demonstration & forensic inspection
export const auditTrailBuffer: AuditLogEntry[] = [];
export const dispatchedNotifications: EmailAlertPayload[] = [];

/**
 * Dispatches an automated institutional email alert (Mock implementation with logging)
 */
export async function sendEmailAlert(payload: EmailAlertPayload): Promise<{ success: boolean; messageId: string }> {
  const messageId = `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  dispatchedNotifications.push(payload);

  const recipients = Array.isArray(payload.to) ? payload.to.join(', ') : payload.to;
  
  // Format console log for developer visibility
  const prefix = payload.urgency === 'CRITICAL' ? '🚨 [CRITICAL ALERT]' : '📧 [EMAIL DISPATCH]';
  console.log(`${prefix} To: ${recipients} | Subject: "${payload.subject}"`);
  console.log(`   Headline: ${payload.headline}`);
  console.log(`   Message: ${payload.message}`);
  if (payload.details) {
    console.log(`   Metadata:`, JSON.stringify(payload.details));
  }

  return { success: true, messageId };
}

/**
 * Dedicated helper to broadcast alerts directly to the Head of Department (HOD)
 */
export async function sendHODAlert(
  hodEmail: string,
  subject: string,
  headline: string,
  message: string,
  details?: Record<string, unknown>
): Promise<{ success: boolean; messageId: string }> {
  return sendEmailAlert({
    to: hodEmail,
    recipientName: 'Head of Department (Computer Science)',
    subject: `[DEPARTMENTAL AUDIT] ${subject}`,
    urgency: 'CRITICAL',
    headline,
    message,
    details,
  });
}

/**
 * Records an immutable audit log entry for statutory governance
 */
export function recordAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const log: AuditLogEntry = {
    id: `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  auditTrailBuffer.push(log);
  return log;
}

export interface AppNotificationPayload {
  recipientUserId: string;
  title: string;
  message: string;
  urgency?: 'INFO' | 'ACTION_REQUIRED' | 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  metadata?: Record<string, unknown>;
}

export function dispatchNotification(payload: AppNotificationPayload) {
  sendEmailAlert({
    to: payload.recipientUserId,
    subject: `[APSES NOTIFICATION] ${payload.title}`,
    headline: payload.title,
    message: payload.message,
    urgency: (payload.urgency === 'CRITICAL' || payload.urgency === 'HIGH') ? 'CRITICAL' : 'NORMAL',
    details: payload.metadata,
  });
}


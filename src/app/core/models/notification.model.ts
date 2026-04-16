export interface Notification {
  id:              string;
  user_id:         string;
  title:           string;
  message:         string;
  type:            NotificationType;
  job_request_id:  string | null;
  is_read:         boolean;
  sent_by:         string | null;
  created_at:      string;
}

export type NotificationType =
  | 'new_request'
  | 'rejection'
  | 'cancellation'
  | 'escalation'
  | 'job_completed'
  | 'system_alert'
  | 'driver_issue'
  | 'lab_issue'
  | 'critical_value'
  | 'report_ready'
  | 'broadcast';
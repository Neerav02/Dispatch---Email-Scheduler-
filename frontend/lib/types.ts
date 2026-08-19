export type EmailStatus = 'queued' | 'in_flight' | 'holding' | 'sent' | 'failed';

export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface Sender {
  id: string;
  userId: string;
  label: string;
  smtpFrom: string;
  maxPerHour: number;
  createdAt: string;
}

export interface ScheduledEmail {
  id: string;
  campaignId: string;
  recipient: string;
  sendAt: string;
  status: EmailStatus;
  heldReason?: string | null;
  sentAt?: string | null;
  etherealUrl?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  campaign: {
    subject: string;
    body?: string;
    sender?: {
      label: string;
      smtpFrom?: string;
    };
  };
}

export interface RunwayResponse {
  data: ScheduledEmail[];
  timestamp: string;
}

export interface RateLimitUsage {
  senderId: string;
  senderLabel: string;
  currentCount: number;
  maxPerHour: number;
  remaining: number;
  percentUsed: number;
  currentHourKey: string;
}

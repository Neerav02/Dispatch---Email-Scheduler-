import { prisma } from './client';
import { emailQueue } from '../queue/email.queue';
import { logger } from '../lib/logger';

async function seed() {
  logger.info('🌱 Seeding Dispatch database with initial demo control tower data...');

  // 1. Create or fetch Demo User
  let demoUser = await prisma.user.findFirst({ where: { email: 'demo.controller@dispatch.tower' } });
  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        googleId: 'demo-google-id-001',
        email: 'demo.controller@dispatch.tower',
        name: 'Demo Tower Controller',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    });
  }

  // 2. Create Sender Identity
  let sender = await prisma.sender.findFirst({ where: { userId: demoUser.id } });
  if (!sender) {
    sender = await prisma.sender.create({
      data: {
        userId: demoUser.id,
        label: 'Dispatch Alpha Flight Operations',
        smtpFrom: 'dispatch-alpha@outbound.tower',
        maxPerHour: 150,
      },
    });
  }

  // 3. Create Sample Campaign
  const campaign = await prisma.campaign.create({
    data: {
      userId: demoUser.id,
      senderId: sender.id,
      subject: 'Quarterly Outbound Engineering Telemetry Update',
      body: 'Hello {{name}},\n\nThis is an automated dispatch from the ReachInbox scheduling tower.',
      startTime: new Date(),
      delayMs: 1000,
      maxPerHour: 150,
    },
  });

  // 4. Create Sample Scheduled & Sent Emails
  const sampleRecipients = [
    { recipient: 'alex.dev@acmecorp.io', status: 'sent' as const, offsetSec: -300 },
    { recipient: 'sarah.engineering@starlight.tech', status: 'in_flight' as const, offsetSec: 2 },
    { recipient: 'jordan.ops@cloudflight.net', status: 'queued' as const, offsetSec: 25 },
    { recipient: 'marcus.architect@nexus.io', status: 'queued' as const, offsetSec: 60 },
    { recipient: 'elena.lead@hyperion.com', status: 'holding' as const, offsetSec: 120, heldReason: 'Hourly sender cap reached. Rescheduled to next hour.' },
    { recipient: 'david.cto@apexmail.org', status: 'queued' as const, offsetSec: 300 },
    { recipient: 'rachel.head@orbitallabs.com', status: 'queued' as const, offsetSec: 600 },
  ];

  const nowMs = Date.now();
  for (const item of sampleRecipients) {
    const sendAt = new Date(nowMs + item.offsetSec * 1000);

    const createdEmail = await prisma.scheduledEmail.create({
      data: {
        campaignId: campaign.id,
        recipient: item.recipient,
        sendAt,
        status: item.status,
        heldReason: item.heldReason || null,
        sentAt: item.status === 'sent' ? new Date(nowMs - 250 * 1000) : null,
        etherealUrl: item.status === 'sent' ? 'https://ethereal.email/message/demo-preview-link-101' : null,
      },
    });

    if (item.status === 'queued' || item.status === 'holding') {
      const delay = Math.max(0, sendAt.getTime() - nowMs);
      await emailQueue.add(
        'send-email',
        { emailId: createdEmail.id },
        { jobId: createdEmail.id, delay }
      );
    }
  }

  logger.info('✅ Database seeded successfully with demo flight telemetry data!');
  process.exit(0);
}

seed().catch((err) => {
  logger.error('❌ Seeding failed:', err);
  process.exit(1);
});

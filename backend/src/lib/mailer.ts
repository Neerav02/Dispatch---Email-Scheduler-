import nodemailer from 'nodemailer';
import { logger } from './logger';

let transporter: nodemailer.Transporter | null = null;

export async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  try {
    // Generate automated Ethereal Email test account
    const testAccount = await nodemailer.createTestAccount();
    logger.info(`📧 Created Ethereal SMTP account: ${testAccount.user}`);

    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    return transporter;
  } catch (err) {
    logger.error('Failed to create Ethereal SMTP test account, falling back to local json transport', err);
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return transporter;
  }
}

export async function sendEmail({
  from,
  to,
  subject,
  html,
}: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  const mailTransporter = await getTransporter();
  const info = await mailTransporter.sendMail({
    from,
    to,
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || null;
  return {
    messageId: info.messageId,
    previewUrl: previewUrl ? String(previewUrl) : null,
  };
}

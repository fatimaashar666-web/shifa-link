import 'server-only'

import nodemailer from 'nodemailer'

type VerificationEmailInput = {
  to: string
  name: string
  verificationUrl: string
}

function getEmailMode() {
  return process.env.EMAIL_DELIVERY_MODE?.trim().toLowerCase() ?? 'smtp'
}

function getSmtpConfig() {
  const host = process.env.EMAIL_SMTP_HOST?.trim()
  const port = Number(process.env.EMAIL_SMTP_PORT ?? '587')
  const user = process.env.EMAIL_SMTP_USER?.trim()
  const password = process.env.EMAIL_SMTP_PASSWORD
  const from = process.env.EMAIL_FROM?.trim()

  if (!host || host.startsWith('REPLACE_WITH_') || !Number.isInteger(port) || port <= 0 || !user || user.startsWith('REPLACE_WITH_') || !password || password.startsWith('REPLACE_WITH_') || !from || from.includes('example.com')) {
    return null
  }

  return { host, port, user, password, from }
}

export function isEmailDeliveryConfigured() {
  return getEmailMode() === 'console' || getSmtpConfig() !== null
}

export async function sendVerificationEmail({ to, name, verificationUrl }: VerificationEmailInput) {
  if (getEmailMode() === 'console') {
    console.info(`[email:console] Verification link for ${to}: ${verificationUrl}`)
    return
  }

  const config = getSmtpConfig()
  if (!config) {
    throw new Error('Email delivery is not configured. Set EMAIL_* SMTP variables or EMAIL_DELIVERY_MODE=console.')
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.password },
  })

  await transporter.sendMail({
    from: config.from,
    to,
    subject: 'Verify your ShifaLink email address',
    text: `Hello ${name},\n\nVerify your ShifaLink email address by opening this link:\n${verificationUrl}\n\nThis link expires in 24 hours. If you did not create this account, you can ignore this email.`,
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0f172a"><h2>Verify your ShifaLink email address</h2><p>Hello ${escapeHtml(name)},</p><p>Confirm your email address to activate your patient account.</p><p><a href="${escapeHtml(verificationUrl)}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px">Verify email address</a></p><p>This link expires in 24 hours. If you did not create this account, you can ignore this email.</p></body></html>`,
  })
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }
    return entities[character]
  })
}

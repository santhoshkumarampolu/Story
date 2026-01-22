import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });

  return transporter;
}

interface VerificationEmailParams {
  email: string;
  token: string;
  name?: string | null;
}

export async function sendVerificationEmail({ email, token, name }: VerificationEmailParams) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
  const from = process.env.EMAIL_FROM;

  if (!from) {
    throw new Error("EMAIL_FROM environment variable is not set.");
  }

  const greeting = name ? `Hi ${name},` : "Hi,";

  await getTransporter().sendMail({
    from,
    to: email,
    subject: "Verify your AI Story Studio account",
    text: `${greeting}\n\nPlease verify your account by clicking the link below:\n${verificationUrl}\n\nIf you did not create an account, you can ignore this email.\n`,
    html: `
      <p>${greeting}</p>
      <p>Thanks for creating an AI Story Studio account. Please confirm your email address by clicking the button below.</p>
      <p>
        <a href="${verificationUrl}" style="display:inline-block;padding:12px 20px;background:#111827;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:600;">
          Verify Email
        </a>
      </p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>If you did not sign up, feel free to ignore this email.</p>
    `
  });
}

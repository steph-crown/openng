import { Resend } from "resend";

export type SendMailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendMail(options: SendMailOptions): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is required to send email");
  }
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error("RESEND_FROM_EMAIL is required to send email");
  }
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function sendMagicLink(email: string, token: string): Promise<void> {
  const baseUrl = process.env.API_URL ?? process.env.APP_URL;
  if (!baseUrl) {
    throw new Error("API_URL or APP_URL is required");
  }
  const base = baseUrl.replace(/\/$/, "");
  const verifyUrl = `${base}/auth/verify?token=${encodeURIComponent(token)}`;
  const subject = "Sign in to OpenNG";
  const text = `Open ${verifyUrl} to sign in. This link expires in 15 minutes.`;
  const html = `<p><a href="${verifyUrl}">Sign in to OpenNG</a></p><p>This link expires in 15 minutes.</p>`;
  await sendMail({ to: email, subject, text, html });
}

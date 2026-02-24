// app/lib/email.ts
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) throw new Error("Missing RESEND_API_KEY");

const resend = new Resend(apiKey);

export async function sendOrderEmail({
  to,
  subject,
  text
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const from = process.env.EMAIL_FROM?.trim();
  if (!from) throw new Error("Missing EMAIL_FROM");

  return resend.emails.send({
    from,
    to,
    subject,
    text
  });
}
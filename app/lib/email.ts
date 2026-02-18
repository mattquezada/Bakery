// app/lib/email.ts

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmail({
  to,
  subject,
  text
}: {
  to: string;
  subject: string;
  text: string;
}) {
  return resend.emails.send({
    from: "Amias Bakery <orders@orders.amiasbakery.com>",
    to,
    subject,
    text
  });
}

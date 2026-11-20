"use server";

import { Resend } from "resend";

import { ContactNotification } from "@/emails/contact-notification";

const FROM = "Portfolio contact <contact@mail.fusan.me>";
const TO = "fuad.antor@gmail.com";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactInput = {
  name: string;
  email: string;
  message: string;
  // Honeypot: hidden from people, filled in by naive bots.
  company?: string;
};

export type ContactResult = { ok: true } | { ok: false };

// Server Actions are reachable by direct POST, so everything the client
// validated is checked again here.
export async function sendContact(input: ContactInput): Promise<ContactResult> {
  const name = String(input?.name ?? "").trim();
  const email = String(input?.email ?? "").trim().toLowerCase();
  const message = String(input?.message ?? "").trim();

  // Pretend success so the bot doesn't retry.
  if (input?.company) return { ok: true };

  if (
    name.length < 3 ||
    name.length > 100 ||
    email.length > 254 ||
    !EMAIL_PATTERN.test(email) ||
    message.length < 5 ||
    message.length > 5000
  ) {
    return { ok: false };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[CONTACT_ERROR]: RESEND_API_KEY is not set");
    return { ok: false };
  }

  const receivedAt = new Intl.DateTimeFormat("en-GB", {
    // dateStyle/timeStyle can't be combined with timeZoneName; it throws.
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Dhaka",
    timeZoneName: "short",
  }).format(new Date());

  // React Email escapes visitor input; the plain-text part is the fallback.
  const { error } = await new Resend(apiKey).emails.send({
    from: FROM,
    to: TO,
    replyTo: email,
    subject: `[Portfolio] ${name.replace(/[\r\n]+/g, " ")}`,
    react: (
      <ContactNotification
        name={name}
        email={email}
        message={message}
        receivedAt={receivedAt}
      />
    ),
    text: `${message}\n\n—\n${name} <${email}>\n${receivedAt}`,
  });

  if (error) {
    console.error("[CONTACT_ERROR]: ", error);
    return { ok: false };
  }
  return { ok: true };
}

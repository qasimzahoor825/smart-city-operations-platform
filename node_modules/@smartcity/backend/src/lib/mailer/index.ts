import nodemailer, { type Transporter } from "nodemailer";
import { config } from "../../config";

interface MailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transport: Transporter =
  config.mail.transport === "smtp"
    ? nodemailer.createTransport({})
    : nodemailer.createTransport({ jsonTransport: true });

export const mailer = {
  async send(message: MailMessage): Promise<unknown> {
    const result = await transport.sendMail({
      from: config.mail.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    console.log(`[mail:${config.mail.transport}] queued mail to ${message.to} — ${message.subject}`);
    return result;
  },

  async sendPasswordReset(to: string, token: string): Promise<unknown> {
    return this.send({
      to,
      subject: "SmartCity OS — Password Reset",
      html: `<p>Use the link below to reset your password.</p><p><a href="/reset-password?token=${token}">Reset password</a></p><p>This link expires in 1 hour.</p>`,
    });
  },

  async sendVerification(to: string, token: string): Promise<unknown> {
    return this.send({
      to,
      subject: "SmartCity OS — Verify your email",
      html: `<p>Verify your email by opening: <code>${token}</code></p>`,
    });
  },
};

export default mailer;
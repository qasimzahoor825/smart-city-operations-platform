import nodemailer, { type Transporter } from "nodemailer";
import { config } from "../../config";

interface MailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const hasSmtpConfig = Boolean(config.mail.smtp.host && config.mail.smtp.user);

const transport: Transporter =
  config.mail.transport === "smtp" && hasSmtpConfig
    ? nodemailer.createTransport({
        host: config.mail.smtp.host,
        port: config.mail.smtp.port,
        secure: config.mail.smtp.secure,
        auth: { user: config.mail.smtp.user, pass: config.mail.smtp.pass },
        requireTLS: !config.mail.smtp.secure,
      })
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
    const sentTo = (result as { messageId?: string; envelope?: { to: string[] } })?.envelope?.to?.[0] ?? message.to;
    console.log(`[mail:${config.mail.transport}] queued mail to ${message.to} — ${message.subject}`);
    if (config.mail.transport !== "smtp") {
      const json = result as unknown as { message?: { to?: string; html?: string } };
      console.log(`[mail:mock] OTP preview -> ${sentTo}: ${json?.message?.html ?? ""}`);
    }
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

  async sendOtp(to: string, otp: string, name?: string): Promise<unknown> {
    if (config.mail.transport !== "smtp") {
      // eslint-disable-next-line no-console
      console.log(`[mail:mock] OTP for ${to}: ${otp}`);
    }
    return this.send({
      to,
      subject: "SmartCity OS — Your email verification code",
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#0f766e,#0284c7);padding:20px 24px;">
            <h2 style="margin:0;color:#ffffff;font-size:18px;">SmartCity OS</h2>
          </div>
          <div style="padding:24px;">
            <p style="color:#0f172a;font-size:15px;">Hi${name ? " " + name : ""},</p>
            <p style="color:#334155;font-size:14px;">Use the code below to verify your email. It expires in <strong>10 minutes</strong>.</p>
            <div style="background:#f0fdfa;border:1px dashed #0d9488;border-radius:8px;padding:16px;text-align:center;margin:20px 0;">
              <span style="font-family:monospace;font-size:28px;font-weight:800;letter-spacing:8px;color:#0f766e;">${otp}</span>
            </div>
            <p style="color:#94a3b8;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>`,
    });
  },
};

export default mailer;
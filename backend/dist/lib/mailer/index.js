"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../../config");
const transport = config_1.config.mail.transport === "smtp"
    ? nodemailer_1.default.createTransport({})
    : nodemailer_1.default.createTransport({ jsonTransport: true });
exports.mailer = {
    async send(message) {
        const result = await transport.sendMail({
            from: config_1.config.mail.from,
            to: message.to,
            subject: message.subject,
            text: message.text,
            html: message.html,
        });
        console.log(`[mail:${config_1.config.mail.transport}] queued mail to ${message.to} — ${message.subject}`);
        return result;
    },
    async sendPasswordReset(to, token) {
        return this.send({
            to,
            subject: "SmartCity OS — Password Reset",
            html: `<p>Use the link below to reset your password.</p><p><a href="/reset-password?token=${token}">Reset password</a></p><p>This link expires in 1 hour.</p>`,
        });
    },
    async sendVerification(to, token) {
        return this.send({
            to,
            subject: "SmartCity OS — Verify your email",
            html: `<p>Verify your email by opening: <code>${token}</code></p>`,
        });
    },
};
exports.default = exports.mailer;
//# sourceMappingURL=index.js.map
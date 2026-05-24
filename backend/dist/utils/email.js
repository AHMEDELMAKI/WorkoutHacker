"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = sendOtpEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../utils/logger");
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
async function sendOtpEmail(email, code) {
    const subject = 'Your Workout Hacker Verification Code';
    const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#875BA4">Workout Hacker</h2>
      <p>Your one-time verification code is:</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#6B3FA0;text-align:center;padding:16px 0">${code}</div>
      <p style="color:#888">This code expires in ${process.env.OTP_EXPIRES_IN_MINUTES || 10} minutes.</p>
      <hr style="border-color:#eee"/>
      <p style="color:#aaa;font-size:12px">If you didn't request this, please ignore this email.</p>
    </div>
  `;
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject,
            html,
        });
        logger_1.logger.info(`OTP email sent to ${email}`);
    }
    catch (err) {
        logger_1.logger.error(`Failed to send OTP email to ${email}`, err);
        throw err;
    }
}
async function sendPasswordResetEmail(email, code) {
    const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#875BA4">Reset Your Password</h2>
      <p>Your password reset code is:</p>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#6B3FA0;text-align:center;padding:16px 0">${code}</div>
      <p style="color:#888">This code expires in ${process.env.OTP_EXPIRES_IN_MINUTES || 10} minutes.</p>
    </div>
  `;
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Workout Hacker — Password Reset',
            html,
        });
    }
    catch (err) {
        logger_1.logger.error(`Failed to send password reset email to ${email}`, err);
        throw err;
    }
}
//# sourceMappingURL=email.js.map
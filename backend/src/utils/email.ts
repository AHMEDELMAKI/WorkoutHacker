import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendOtpEmail(email: string, code: string): Promise<void> {
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
        logger.info(`OTP email sent to ${email}`);
    } catch (err) {
        logger.error(`Failed to send OTP email to ${email}`, err);
        throw err;
    }
}

export async function sendPasswordResetEmail(email: string, code: string): Promise<void> {
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
    } catch (err) {
        logger.error(`Failed to send password reset email to ${email}`, err);
        throw err;
    }
}

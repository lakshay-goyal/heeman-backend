import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendPhoneOtp, verifyPhoneOtp, resendPhoneOtp } from "../services/msg91Service";
import nodemailer from "nodemailer";
import { ENV } from "../config/env.config";

// In-memory store: email → { otp, expiresAt }
const emailOtpStore = new Map<string, { otp: string; expiresAt: number }>();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_PORT === 465,
    auth: { user: ENV.SMTP_USER, pass: ENV.SMTP_PASS },
});

// ── EMAIL ──────────────────────────────────────────────────────────────────

export const sendEmailOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ success: false, error: "Email is required." });
        return;
    }

    const otp = generateOtp();
    emailOtpStore.set(email, { otp, expiresAt: Date.now() + OTP_TTL_MS });

    await transporter.sendMail({
        from: ENV.SMTP_FROM,
        to: email,
        subject: "Heeman – Your Email Verification Code",
        html: `
            <div style="font-family: serif; max-width: 520px; margin: auto; padding: 48px 40px; border: 1px solid #eee;">
                <h1 style="text-transform: uppercase; font-weight: 300; letter-spacing: 0.3em; text-align: center; font-size: 22px; margin-bottom: 4px;">Heeman</h1>
                <p style="text-align: center; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 40px;">Email Verification</p>
                <p style="font-size: 15px; color: #333; margin-bottom: 24px;">Use the code below to verify your email address. This code expires in <strong>5 minutes</strong>.</p>
                <div style="background: #f5f5f5; border: 1px solid #e0e0e0; padding: 28px; text-align: center; margin-bottom: 32px;">
                    <span style="font-size: 42px; font-weight: 700; letter-spacing: 0.3em; color: #1a1a1a;">${otp}</span>
                </div>
                <p style="font-size: 12px; color: #aaa;">If you didn't request this, you can safely ignore this email.</p>
                <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;" />
                <p style="font-size: 11px; color: #bbb; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">Heeman Collective &copy; 2026</p>
            </div>
        `,
    });

    res.json({ success: true, message: "Verification code sent to your email." });
});

export const confirmEmailOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        res.status(400).json({ success: false, error: "Email and OTP are required." });
        return;
    }

    const record = emailOtpStore.get(email);
    if (!record) {
        res.status(400).json({ success: false, error: "No verification code found. Please request a new one." });
        return;
    }
    if (Date.now() > record.expiresAt) {
        emailOtpStore.delete(email);
        res.status(400).json({ success: false, error: "Code has expired. Please request a new one." });
        return;
    }
    if (record.otp !== otp.toString()) {
        res.status(400).json({ success: false, error: "Invalid code. Please try again." });
        return;
    }

    emailOtpStore.delete(email);
    res.json({ success: true, message: "Email verified successfully." });
});

// ── PHONE ──────────────────────────────────────────────────────────────────

export const sendPhoneOtpHandler = asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body;
    if (!phone) {
        res.status(400).json({ success: false, error: "Phone number is required." });
        return;
    }

    const result = await sendPhoneOtp(phone);
    if (!result.success) {
        res.status(500).json({ success: false, error: result.message });
        return;
    }
    res.json({ success: true, message: result.message });
});

export const confirmPhoneOtpHandler = asyncHandler(async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        res.status(400).json({ success: false, error: "Phone and OTP are required." });
        return;
    }

    const result = await verifyPhoneOtp(phone, otp);
    if (!result.valid) {
        res.status(400).json({ success: false, error: result.message });
        return;
    }
    res.json({ success: true, message: result.message });
});

export const resendPhoneOtpHandler = asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body;
    if (!phone) {
        res.status(400).json({ success: false, error: "Phone number is required." });
        return;
    }

    const result = await resendPhoneOtp(phone);
    if (!result.success) {
        res.status(500).json({ success: false, error: result.message });
        return;
    }
    res.json({ success: true, message: result.message });
});

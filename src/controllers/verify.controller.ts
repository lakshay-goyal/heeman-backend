import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendPhoneOtp, verifyPhoneOtp, resendPhoneOtp } from "../services/msg91Service";
import nodemailer from "nodemailer";
import { ENV } from "../config/env.config";
import { prisma } from "../lib/prisma";
import {
    cleanPhone,
    createVerificationToken,
    hashOtp,
    hashValue,
    verifySignedToken,
} from "../services/verificationToken.service";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const getIp = (req: Request) => {
    const forwarded = req.headers["x-forwarded-for"];
    return Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0] || req.ip;
};

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

    const normalizedEmail = email.trim().toLowerCase();
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await prisma.enquiryVerification.create({
        data: {
            channel: "EMAIL",
            email: normalizedEmail,
            otpHash: hashOtp(normalizedEmail, otp),
            expiresAt,
            ipAddress: getIp(req),
            userAgent: req.headers["user-agent"],
        },
    });

    await transporter.sendMail({
        from: ENV.SMTP_FROM,
        to: normalizedEmail,
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

    const normalizedEmail = email.trim().toLowerCase();
    const record = await prisma.enquiryVerification.findFirst({
        where: {
            channel: "EMAIL",
            email: normalizedEmail,
            status: "PENDING",
        },
        orderBy: { createdAt: "desc" },
    });

    if (!record) {
        res.status(400).json({ success: false, error: "No verification code found. Please request a new one." });
        return;
    }

    if (Date.now() > record.expiresAt.getTime()) {
        await prisma.enquiryVerification.update({
            where: { id: record.id },
            data: { status: "EXPIRED" },
        });
        res.status(400).json({ success: false, error: "Code has expired. Please request a new one." });
        return;
    }

    if (record.otpHash !== hashOtp(normalizedEmail, otp.toString())) {
        await prisma.enquiryVerification.update({
            where: { id: record.id },
            data: {
                attemptCount: { increment: 1 },
                ...(record.attemptCount >= 4 ? { status: "FAILED" } : {}),
            },
        });
        res.status(400).json({ success: false, error: "Invalid code. Please try again." });
        return;
    }

    const verifiedAt = new Date();
    const emailVerificationToken = createVerificationToken({
        kind: "email_verification",
        verificationId: record.id,
        email: normalizedEmail,
        exp: Date.now() + VERIFICATION_TOKEN_TTL_MS,
    });

    await prisma.enquiryVerification.update({
        where: { id: record.id },
        data: {
            status: "VERIFIED",
            verifiedAt,
            tokenHash: hashValue(emailVerificationToken),
        },
    });

    res.json({
        success: true,
        message: "Email verified successfully.",
        emailVerificationToken,
        verifiedAt,
    });
});

// ── PHONE ──────────────────────────────────────────────────────────────────

export const sendPhoneOtpHandler = asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body;
    if (!phone) {
        res.status(400).json({ success: false, error: "Phone number is required." });
        return;
    }

    const normalizedPhone = cleanPhone(phone);
    const result = await sendPhoneOtp(normalizedPhone);
    if (!result.success) {
        res.status(500).json({ success: false, error: result.message });
        return;
    }

    await prisma.enquiryVerification.create({
        data: {
            channel: "PHONE",
            phone: normalizedPhone,
            expiresAt: new Date(Date.now() + OTP_TTL_MS),
            ipAddress: getIp(req),
            userAgent: req.headers["user-agent"],
        },
    });

    res.json({ success: true, message: result.message });
});

export const confirmPhoneOtpHandler = asyncHandler(async (req: Request, res: Response) => {
    const { phone, otp, email, emailVerificationToken } = req.body;
    if (!phone || !otp) {
        res.status(400).json({ success: false, error: "Phone and OTP are required." });
        return;
    }

    let normalizedEmail: string | undefined;
    let emailVerifiedAt: Date | undefined;
    if (email || emailVerificationToken) {
        if (!email || !emailVerificationToken) {
            res.status(400).json({ success: false, error: "Email verification proof is incomplete." });
            return;
        }

        normalizedEmail = email.trim().toLowerCase();
        const emailPayload = verifySignedToken(emailVerificationToken);
        if (
            !emailPayload ||
            emailPayload.kind !== "email_verification" ||
            emailPayload.email !== normalizedEmail
        ) {
            res.status(400).json({ success: false, error: "Email verification proof is invalid or expired." });
            return;
        }

        const emailRecord = await prisma.enquiryVerification.findFirst({
            where: {
                id: emailPayload.verificationId,
                email: normalizedEmail,
                channel: "EMAIL",
                status: "VERIFIED",
                tokenHash: hashValue(emailVerificationToken),
            },
        });
        if (!emailRecord?.verifiedAt) {
            res.status(400).json({ success: false, error: "Email verification proof could not be confirmed." });
            return;
        }
        emailVerifiedAt = emailRecord.verifiedAt;
    }

    const normalizedPhone = cleanPhone(phone);
    const result = await verifyPhoneOtp(normalizedPhone, otp);
    if (!result.valid) {
        res.status(400).json({ success: false, error: result.message });
        return;
    }

    const record = await prisma.enquiryVerification.findFirst({
        where: {
            channel: "PHONE",
            phone: normalizedPhone,
            status: "PENDING",
        },
        orderBy: { createdAt: "desc" },
    });

    const verifiedAt = new Date();
    const phoneVerification = record
        ? await prisma.enquiryVerification.update({
            where: { id: record.id },
            data: {
                status: "VERIFIED",
                verifiedAt,
                email: normalizedEmail,
            },
        })
        : await prisma.enquiryVerification.create({
            data: {
                channel: "PHONE",
                phone: normalizedPhone,
                email: normalizedEmail,
                status: "VERIFIED",
                verifiedAt,
                expiresAt: new Date(Date.now() + OTP_TTL_MS),
                ipAddress: getIp(req),
                userAgent: req.headers["user-agent"],
            },
        });

    const verificationToken = createVerificationToken({
        kind: "enquiry_verification",
        verificationId: phoneVerification.id,
        email: normalizedEmail,
        phone: normalizedPhone,
        exp: Date.now() + VERIFICATION_TOKEN_TTL_MS,
    });

    await prisma.enquiryVerification.update({
        where: { id: phoneVerification.id },
        data: {
            tokenHash: hashValue(verificationToken),
        },
    });

    res.json({
        success: true,
        message: result.message,
        verificationToken,
        email: normalizedEmail,
        phone: normalizedPhone,
        emailVerifiedAt,
        phoneVerifiedAt: verifiedAt,
    });
});

export const resendPhoneOtpHandler = asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body;
    if (!phone) {
        res.status(400).json({ success: false, error: "Phone number is required." });
        return;
    }

    const normalizedPhone = cleanPhone(phone);
    const result = await resendPhoneOtp(normalizedPhone);
    if (!result.success) {
        res.status(500).json({ success: false, error: result.message });
        return;
    }

    await prisma.enquiryVerification.create({
        data: {
            channel: "PHONE",
            phone: normalizedPhone,
            expiresAt: new Date(Date.now() + OTP_TTL_MS),
            ipAddress: getIp(req),
            userAgent: req.headers["user-agent"],
        },
    });

    res.json({ success: true, message: result.message });
});

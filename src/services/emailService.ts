import nodemailer from "nodemailer";
import { ENV } from "../config/env.config";

const transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
    },
});

export const sendOTPEmail = async (email: string, otp: string) => {
    const mailOptions = {
        from: ENV.SMTP_FROM,
        to: email,
        subject: "HeMan - Your Login OTP",
        text: `Your one-time password for logging in to HeMan is: ${otp}. It will expire in 5 minutes.`,
        html: `
            <div style="font-family: serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee;">
                <h1 style="text-transform: uppercase; font-weight: 300; letter-spacing: 0.2em; text-align: center;">HeMan</h1>
                <p style="text-align: center; color: #666; font-style: italic;">Verification Required</p>
                <div style="background: #f9f9f9; padding: 20px; text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 0.3em; color: #BC9C22;">${otp}</span>
                </div>
                <p style="color: #666; line-height: 1.6; text-align: center;">
                    Enter this code in your login screen to securely access your account. 
                    This code will expire in 5 minutes.
                </p>
                <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #999; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">
                    HeMan Collective &copy; 2026
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] OTP sent successfully to ${email}`);
    } catch (error) {
        console.error("[EMAIL] Error sending OTP email:", error);
        throw new Error("Failed to send OTP email");
    }
};

import nodemailer from "nodemailer";
import { ENV } from "../config/env.config";

const createTransporter = () => nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
    },
});

// Email service for sending contact inquiries and other notifications

export const sendContactEmail = async (data: { name: string, email: string, subject: string, message: string }) => {
    const mailOptions = {
        from: ENV.SMTP_FROM,
        to: ENV.ADMIN_EMAIL,
        replyTo: data.email,
        subject: `New Contact Form Submission: ${data.subject}`,
        text: `Name: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}\n\nMessage:\n${data.message}`,
        html: `
            <div style="font-family: serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee;">
                <h1 style="text-transform: uppercase; font-weight: 300; letter-spacing: 0.2em; text-align: center;">Heeman</h1>
                <p style="text-align: center; color: #666; font-style: italic;">New Customer Inquiry</p>
                <div style="background: #f9f9f9; padding: 30px; margin: 30px 0;">
                    <p style="margin-bottom: 10px;"><strong>Name:</strong> ${data.name}</p>
                    <p style="margin-bottom: 10px;"><strong>Email:</strong> ${data.email}</p>
                    <p style="margin-bottom: 20px;"><strong>Subject:</strong> ${data.subject}</p>
                    <div style="border-top: 1px solid #ddd; padding-top: 20px;">
                        <p style="line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
                    </div>
                </div>
                <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #999; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">
                    Heeman Collective &copy; 2026 Admin Notification
                </p>
            </div>
        `,
    };

    try {
        await createTransporter().sendMail(mailOptions);
        console.log(`[EMAIL] Contact inquiry sent successfully from ${data.email}`);
    } catch (error) {
        console.error("[EMAIL] Error sending contact email:", error);
        throw new Error("Failed to send contact inquiry");
    }
};

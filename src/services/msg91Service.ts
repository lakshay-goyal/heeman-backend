import { ENV } from "../config/env.config";

interface VerificationResponse {
    success: boolean;
    message?: string;
}

interface VerificationCheckResponse {
    valid: boolean;
    message?: string;
}

// Clean phone number to digits only (e.g. +91XXXXXXXXXX → 91XXXXXXXXXX)
const cleanPhone = (phone: string) => phone.replace(/\D/g, "");

export const sendPhoneOtp = async (phone: string): Promise<VerificationResponse> => {
    const mobile = cleanPhone(phone);

    console.log("[MSG91] sendPhoneOtp called");
    console.log("[MSG91] Cleaned mobile:", mobile);
    console.log("[MSG91] AUTH_KEY set:", !!ENV.MSG91_AUTH_KEY, "| Key prefix:", ENV.MSG91_AUTH_KEY?.slice(0, 6));
    console.log("[MSG91] TEMPLATE_ID:", ENV.MSG91_TEMPLATE_ID);

    const payload = {
        mobile,
        template_id: ENV.MSG91_TEMPLATE_ID,
        otp_length: 6,
        otp_expiry: 5,
    };
    console.log("[MSG91] Request payload:", JSON.stringify(payload));

    let response: Response;
    try {
        response = await fetch("https://control.msg91.com/api/v5/otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                authkey: ENV.MSG91_AUTH_KEY,
            },
            body: JSON.stringify(payload),
        });
    } catch (fetchErr: any) {
        console.error("[MSG91] Network error calling MSG91:", fetchErr.message);
        throw fetchErr;
    }

    console.log("[MSG91] HTTP status:", response.status, response.statusText);

    const data = await response.json() as any;
    console.log("[MSG91] Response body:", JSON.stringify(data));

    if (data.type === "success") {
        console.log("[MSG91] OTP sent successfully");
        return { success: true, message: "OTP sent successfully" };
    }

    // MSG91 sometimes returns 200 with type !== "success" on errors
    console.error("[MSG91] Send OTP failed. type:", data.type, "message:", data.message);
    return { success: false, message: data.message || "Failed to send OTP" };
};

export const verifyPhoneOtp = async (phone: string, otp: string): Promise<VerificationCheckResponse> => {
    const mobile = cleanPhone(phone);

    console.log("[MSG91] verifyPhoneOtp called | mobile:", mobile, "| otp:", otp);

    const url = `https://control.msg91.com/api/v5/otp/verify?mobile=${mobile}&otp=${otp}`;
    console.log("[MSG91] Verify URL:", url);

    let response: Response;
    try {
        response = await fetch(url, {
            method: "GET",
            headers: { authkey: ENV.MSG91_AUTH_KEY },
        });
    } catch (fetchErr: any) {
        console.error("[MSG91] Network error verifying OTP:", fetchErr.message);
        throw fetchErr;
    }

    console.log("[MSG91] Verify HTTP status:", response.status, response.statusText);

    const data = await response.json() as any;
    console.log("[MSG91] Verify response body:", JSON.stringify(data));

    if (data.type === "success" || data.message === "OTP verified success") {
        console.log("[MSG91] OTP verified successfully");
        return { valid: true, message: "OTP verified successfully" };
    }
    if (data.message === "OTP expired") {
        console.warn("[MSG91] OTP expired");
        return { valid: false, message: "OTP has expired. Please request a new one." };
    }
    console.warn("[MSG91] OTP verification failed:", data.message);
    return { valid: false, message: data.message || "Invalid OTP" };
};

export const resendPhoneOtp = async (phone: string): Promise<VerificationResponse> => {
    const mobile = cleanPhone(phone);

    console.log("[MSG91] resendPhoneOtp called | mobile:", mobile);

    const url = `https://control.msg91.com/api/v5/otp/retry?mobile=${mobile}&retrytype=text`;
    console.log("[MSG91] Resend URL:", url);

    let response: Response;
    try {
        response = await fetch(url, {
            method: "GET",
            headers: { authkey: ENV.MSG91_AUTH_KEY },
        });
    } catch (fetchErr: any) {
        console.error("[MSG91] Network error resending OTP:", fetchErr.message);
        throw fetchErr;
    }

    console.log("[MSG91] Resend HTTP status:", response.status, response.statusText);

    const data = await response.json() as any;
    console.log("[MSG91] Resend response body:", JSON.stringify(data));

    if (data.type === "success") {
        console.log("[MSG91] OTP resent successfully");
        return { success: true, message: "OTP resent successfully" };
    }
    console.error("[MSG91] Resend failed:", data.message);
    return { success: false, message: data.message || "Failed to resend OTP" };
};

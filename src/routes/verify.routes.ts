import { Router } from "express";
import {
    sendEmailOtp,
    confirmEmailOtp,
    sendPhoneOtpHandler,
    confirmPhoneOtpHandler,
    resendPhoneOtpHandler,
} from "../controllers/verify.controller";
import { rateLimit } from "../middlewares/rateLimit";

const router = Router();

router.post("/email/send", rateLimit("verify:email:send", 5, 10 * 60 * 1000), sendEmailOtp);
router.post("/email/confirm", rateLimit("verify:email:confirm", 10, 10 * 60 * 1000), confirmEmailOtp);

router.post("/phone/send", rateLimit("verify:phone:send", 5, 10 * 60 * 1000), sendPhoneOtpHandler);
router.post("/phone/confirm", rateLimit("verify:phone:confirm", 10, 10 * 60 * 1000), confirmPhoneOtpHandler);
router.post("/phone/resend", rateLimit("verify:phone:resend", 5, 10 * 60 * 1000), resendPhoneOtpHandler);

export default router;

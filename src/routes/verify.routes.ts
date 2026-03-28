import { Router } from "express";
import {
    sendEmailOtp,
    confirmEmailOtp,
    sendPhoneOtpHandler,
    confirmPhoneOtpHandler,
    resendPhoneOtpHandler,
} from "../controllers/verify.controller";

const router = Router();

router.post("/email/send", sendEmailOtp);
router.post("/email/confirm", confirmEmailOtp);

router.post("/phone/send", sendPhoneOtpHandler);
router.post("/phone/confirm", confirmPhoneOtpHandler);
router.post("/phone/resend", resendPhoneOtpHandler);

export default router;

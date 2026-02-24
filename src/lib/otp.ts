import { prisma } from "./db";
import { randomInt } from "crypto";

/**
 * Generate a 6-digit OTP for a phone number.
 * Stores in DB with 5-minute expiry. Invalidates previous OTPs.
 */
export async function generateOTP(phone: string): Promise<string> {
    // Invalidate old codes for this phone
    await prisma.otpCode.updateMany({
        where: { phone, used: false },
        data: { used: true },
    });

    const code = String(randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otpCode.create({
        data: { phone, code, expiresAt },
    });

    // MVP: log to console (replace with Twilio in production)
    sendOTP(phone, code);

    return code;
}

/**
 * Verify an OTP code for a phone number.
 * Returns true if valid and unused.
 */
export async function verifyOTP(phone: string, code: string): Promise<boolean> {
    const otp = await prisma.otpCode.findFirst({
        where: {
            phone,
            code,
            used: false,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
    });

    if (!otp) return false;

    // Mark as used
    await prisma.otpCode.update({
        where: { id: otp.id },
        data: { used: true },
    });

    return true;
}

/**
 * Send OTP via SMS.
 * MVP: console.log only. Replace with Twilio/AWS SNS in production.
 */
function sendOTP(phone: string, code: string): void {
    console.log(`\n📱 SMS OTP for ${phone}: ${code}\n`);
}

"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { generateOTP, verifyOTP } from "@/lib/otp";

const COOKIE_NAME = "current_user_id";
const PROFILE_COOKIE = "has_farm_profile";
const COOKIE_OPTS = { path: "/", maxAge: 60 * 60 * 24 * 30, httpOnly: true, sameSite: "lax" as const };

// ---------- Session helpers ----------

async function setSession(userId: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, userId, COOKIE_OPTS);
    const profile = await prisma.farmProfile.findUnique({ where: { userId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (profile && user?.profileComplete) {
        cookieStore.set(PROFILE_COOKIE, "true", { ...COOKIE_OPTS, httpOnly: false });
    } else {
        cookieStore.delete(PROFILE_COOKIE);
    }
}

// ---------- Register ----------

export async function registerUser(formData: FormData) {
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;
    const phone = (formData.get("phone") as string)?.trim();

    if (!name || !email || !password) {
        return { error: "表示名・メール・パスワードは必須です" };
    }
    if (password.length < 8) {
        return { error: "パスワードは8文字以上で入力してください" };
    }
    if (name.length > 20) {
        return { error: "表示名は20文字以内で入力してください" };
    }

    // Check uniqueness
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
        return { error: "このメールアドレスは既に登録されています" };
    }

    if (phone) {
        const existingPhone = await prisma.user.findFirst({ where: { phoneNumber: phone } });
        if (existingPhone) {
            return { error: "この電話番号は既に登録されています" };
        }
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            emailVerified: true, // MVP: auto-verify email
            phoneNumber: phone || null,
            phoneVerified: false,
            profileComplete: false,
        },
    });

    await setSession(user.id);
    return { success: true, userId: user.id, needsPhoneVerification: !!phone };
}

// ---------- Email + Password Login ----------

export async function loginWithEmail(formData: FormData) {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "メールアドレスとパスワードを入力してください" };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
        return { error: "メールアドレスまたはパスワードが正しくありません" };
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
        return { error: "メールアドレスまたはパスワードが正しくありません" };
    }

    await setSession(user.id);
    return { success: true, profileComplete: user.profileComplete };
}

// ---------- Phone OTP Login ----------

export async function requestOTP(formData: FormData) {
    const phone = (formData.get("phone") as string)?.trim();
    if (!phone) {
        return { error: "電話番号を入力してください" };
    }

    // Check if user exists with this phone
    const user = await prisma.user.findFirst({ where: { phoneNumber: phone } });
    if (!user) {
        return { error: "この電話番号は登録されていません" };
    }

    const code = await generateOTP(phone);
    // MVP: return code for demo display (remove in production)
    return { success: true, demoCode: code };
}

export async function loginWithOTP(formData: FormData) {
    const phone = (formData.get("phone") as string)?.trim();
    const code = (formData.get("code") as string)?.trim();

    if (!phone || !code) {
        return { error: "電話番号とコードを入力してください" };
    }

    const valid = await verifyOTP(phone, code);
    if (!valid) {
        return { error: "コードが無効または期限切れです" };
    }

    const user = await prisma.user.findFirst({ where: { phoneNumber: phone } });
    if (!user) {
        return { error: "ユーザーが見つかりません" };
    }

    // Mark phone as verified
    if (!user.phoneVerified) {
        await prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } });
    }

    await setSession(user.id);
    return { success: true, profileComplete: user.profileComplete };
}

// ---------- Phone verification during registration ----------

export async function requestRegisterOTP(formData: FormData) {
    const phone = (formData.get("phone") as string)?.trim();
    if (!phone) return { error: "電話番号を入力してください" };

    const code = await generateOTP(phone);
    return { success: true, demoCode: code };
}

export async function verifyRegisterOTP(formData: FormData) {
    const phone = (formData.get("phone") as string)?.trim();
    const code = (formData.get("code") as string)?.trim();
    const userId = formData.get("userId") as string;

    if (!phone || !code || !userId) return { error: "入力が不足しています" };

    const valid = await verifyOTP(phone, code);
    if (!valid) return { error: "コードが無効または期限切れです" };

    await prisma.user.update({
        where: { id: userId },
        data: { phoneNumber: phone, phoneVerified: true },
    });

    return { success: true };
}

// ---------- Logout ----------

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    cookieStore.delete(PROFILE_COOKIE);
    return { success: true };
}

// ---------- Legacy: Demo user switch (kept for admin/debug) ----------

export async function switchUser(formData: FormData) {
    const userId = formData.get("userId") as string;
    if (userId) {
        await setSession(userId);
        return { success: true };
    } else {
        await logout();
        return { success: true };
    }
}

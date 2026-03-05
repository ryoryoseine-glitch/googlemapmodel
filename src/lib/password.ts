import { scrypt, ScryptOptions, randomBytes, timingSafeEqual } from "crypto";

// Use lower cost params so hashing completes within Vercel's 10s timeout.
const SCRYPT_PARAMS: ScryptOptions = { N: 16384, r: 8, p: 1 };
const KEY_LEN = 64;

function scryptAsync(password: string, salt: string, keylen: number, options: ScryptOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        scrypt(password, salt, keylen, options, (err, derived) => {
            if (err) reject(err);
            else resolve(derived);
        });
    });
}

export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const derived = await scryptAsync(password, salt, KEY_LEN, SCRYPT_PARAMS);
    return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;
    try {
        const derived = await scryptAsync(password, salt, KEY_LEN, SCRYPT_PARAMS);
        const hashBuffer = Buffer.from(hash, "hex");
        if (derived.length !== hashBuffer.length) return false;
        return timingSafeEqual(derived, hashBuffer);
    } catch {
        return false;
    }
}

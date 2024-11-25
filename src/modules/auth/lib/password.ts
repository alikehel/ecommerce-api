import crypto from "node:crypto";

export async function hashPasswordV1(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString("hex");
        const keyLength = 64;
        const scryptParams = {
            N: 16384,
            r: 8,
            p: 5,
        };
        crypto.scrypt(
            password,
            salt,
            keyLength,
            scryptParams,
            (err, derivedKey) => {
                if (err) reject(err);
                resolve(`v1:${salt}:${derivedKey.toString("hex")}`);
            },
        );
    });
}

export async function verifyPasswordV1(
    password: string,
    hash: string,
): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const [version, salt, key] = hash.split(":");
        if (version !== "v1") {
            return reject(new Error("Unsupported hash version"));
        }
        const keyLength = 64;
        const scryptParams = {
            N: 16384,
            r: 8,
            p: 5,
        };
        crypto.scrypt(
            password,
            salt,
            keyLength,
            scryptParams,
            (err, derivedKey) => {
                if (err) reject(err);
                resolve(key === derivedKey.toString("hex"));
            },
        );
    });
}

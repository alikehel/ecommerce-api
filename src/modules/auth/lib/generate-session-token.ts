import { encodeBase32LowerCaseNoPadding } from "./encode-base-32-lower-case-no-padding";

export function generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = encodeBase32LowerCaseNoPadding(bytes);
    return token;
}

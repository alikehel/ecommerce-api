import { encodeHexLowerCase } from "./encode-hex-lower-case";
import { sha256 } from "./sha256";

export const getSessionId = async (token: string): Promise<string> => {
    return encodeHexLowerCase(await sha256(new TextEncoder().encode(token)));
};

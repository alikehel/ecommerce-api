import { parseEnv } from "@/config";
import type { MiddlewareHandler } from "@/types/app-type";

export const env = (): MiddlewareHandler => {
    return async (c, next) => {
        c.env = parseEnv(Object.assign(c.env || {}, process.env || {}));
        return next();
    };
};

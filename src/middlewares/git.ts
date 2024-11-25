import type { MiddlewareHandler } from "@/types/app-type";

export const git = (): MiddlewareHandler => {
    return async (c, next) => {
        await next();
        c.res.headers.set("X-Git-Branch", c.env.GITHUB_REF_NAME || "");
        c.res.headers.set("X-Git-Commit", c.env.GITHUB_SHA || "");
    };
};

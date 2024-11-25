import type { MiddlewareHandler } from "@/types/app-type";
import { cors as honoCors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

export const cors = (): MiddlewareHandler => {
    return async (c, next) => {
        const allowedHost = c.env.ALLOWED_HOST;
        const origin =
            allowedHost === "*"
                ? "*"
                : new URL(c.req.header("referer") || "").origin;
        if (origin.endsWith(allowedHost)) {
            return honoCors({
                origin,
                allowMethods: [
                    "GET",
                    "POST",
                    "OPTIONS",
                    "PUT",
                    "PATCH",
                    "DELETE",
                ],
                allowHeaders: ["Content-Type", "baggage"],
                exposeHeaders: ["Content-Type"],
                credentials: true,
            })(c, next);
        }
        // If referer is not allowed, fail the request
        throw new HTTPException(403, { message: "Forbidden" });
    };
};

import { UNAUTHORIZED } from "@/lib/http-status-codes";
import { deleteSessionTokenCookie } from "@/modules/auth/lib/delete-session-token-cookie";
import { validateSessionToken } from "@/modules/auth/lib/validate-session-token";
import type {} from "@/types/app-bindings";
import type { MiddlewareHandler } from "@/types/app-type";
import { getCookie } from "hono/cookie";

export const isLoggedIn = (): MiddlewareHandler => {
    return async (c, next) => {
        // csrf protection
        if (c.req.method !== "GET") {
            const origin = c.req.header("Origin");
            // You can also compare it against the Host or X-Forwarded-Host header.
            if (
                origin === null ||
                origin === undefined ||
                origin !== new URL(c.req.url).origin
            ) {
                return c.json(
                    {
                        success: false,
                        error: {
                            message: "Invalid origin",
                        },
                    },
                    UNAUTHORIZED,
                );
            }
        }

        const token = getCookie(c, "session");

        if (!token) {
            return c.json(
                {
                    success: false,
                    error: {
                        message: "Not logged in",
                    },
                },
                UNAUTHORIZED,
            );
        }

        const { session: sessionData, user } = await validateSessionToken(
            c.var.db,
            token,
        );

        if (!sessionData || !user) {
            deleteSessionTokenCookie(c);
            return c.json(
                {
                    success: false,
                    error: {
                        message: "Not logged in",
                    },
                },
                UNAUTHORIZED,
            );
        }

        c.set("user", {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            // sessionId: sessionData.id,
        });

        return next();
    };
};

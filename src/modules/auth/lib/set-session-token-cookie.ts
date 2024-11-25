import type { Bindings, Variables } from "@/types/app-bindings";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";

export function setSessionTokenCookie(
    c: Context<{
        Bindings: Bindings;
        Variables: Variables;
    }>,
    token: string,
    expiresAt: Date,
): void {
    if (c.env.ENV === "prod") {
        setCookie(c, "session", token, {
            httpOnly: true,
            sameSite: "Lax",
            secure: true,
            expires: expiresAt,
        });
    } else if (c.env.ENV === "dev") {
        setCookie(c, "session", token, {
            httpOnly: true,
            sameSite: "Lax",
            secure: false,
            expires: expiresAt,
        });
    }
}

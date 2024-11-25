import type { Bindings, Variables } from "@/types/app-bindings";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";

export function deleteSessionTokenCookie(
    c: Context<{
        Bindings: Bindings;
        Variables: Variables;
    }>,
): void {
    if (c.env.ENV === "prod") {
        setCookie(c, "session", "", {
            httpOnly: true,
            sameSite: "Lax",
            secure: true,
        });
    } else if (c.env.ENV === "dev") {
        setCookie(c, "session", "", {
            httpOnly: true,
            sameSite: "Lax",
            secure: false,
        });
    }
}

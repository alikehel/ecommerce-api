import {} from "@/lib/http-status-codes";
import { OK } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { successResponseSchema } from "@/lib/response-schemas";
import type { AppRouteHandler } from "@/types/app-type";
import { createRoute, z } from "@hono/zod-openapi";
import { getCookie } from "hono/cookie";
import { getSessionId } from "../lib/get-session-id";
import { invalidateSession } from "../lib/invalidate-session";

export const logoutRoute = createRoute({
    tags: ["Auth"],
    method: "get",
    path: "/api/v1/auth/logout",
    summary: "Logout",
    description: "Logout",
    responses: {
        [OK]: jsonContent(successResponseSchema(z.null()), "User logged out"),
    },
});

export const logoutHandler: AppRouteHandler<typeof logoutRoute> = async (c) => {
    const db = c.var.db;
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const sessionToken = getCookie(c, "session")!;
    const sessionId = await getSessionId(sessionToken);

    await invalidateSession(c, db, sessionId);

    return c.json(
        {
            success: true,
            data: null,
        },
        OK,
    );
};

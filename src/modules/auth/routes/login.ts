import { createRoute, z } from "@hono/zod-openapi";

import "@/lib/http-status-codes";
import { OK, UNAUTHORIZED } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { usersLoginSchema, usersSelectSchema } from "@/modules/users/schemas";
import type {} from "@/types/app-bindings";
import type { AppRouteHandler } from "@/types/app-type";

import { createSession } from "../lib/create-session";
import { generateSessionToken } from "../lib/generate-session-token";
import { verifyPasswordV1 } from "../lib/password";
import { setSessionTokenCookie } from "../lib/set-session-token-cookie";
import { sessionTokenSchema } from "../schemas";

export const loginRoute = createRoute({
    tags: ["Auth"],
    method: "post",
    path: "/api/v1/auth/login",
    summary: "Login",
    description: "Login",
    request: {
        body: {
            content: {
                "application/json": { schema: usersLoginSchema },
            },
            description: "User login",
        },
    },
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    user: usersSelectSchema,
                    session: sessionTokenSchema,
                }),
            ),
            "User logged in",
        ),
        [UNAUTHORIZED]: jsonContent(errorResponseSchema, "Invalid credentials"),
    },
});

export const loginHandler: AppRouteHandler<typeof loginRoute> = async (c) => {
    const data = c.req.valid("json");
    const db = c.var.db;

    const user = await c.var.db.query.usersTable.findFirst({
        where: (usersTable, { eq }) => {
            return data.loginWith === "email" ? eq(usersTable.email, data.email) : eq(usersTable.phone, data.phone);
        },
    });

    if (!user) {
        return c.json({ success: false, error: { message: "Invalid credentials" } }, UNAUTHORIZED);
    }

    const isValidPassword = await verifyPasswordV1(data.password, user.password);

    if (!isValidPassword) {
        return c.json(
            {
                success: false,
                error: {
                    message: "Invalid credentials",
                },
            },
            UNAUTHORIZED,
        );
    }

    const token = generateSessionToken();
    const session = await createSession(db, token, user.id);

    setSessionTokenCookie(c, token, session.expiresAt);

    return c.json(
        {
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    verified: user.verified,
                    avatar: user.avatar,
                    globalId: user.globalId,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    deletedAt: user.deletedAt,
                },
                session: {
                    token: token,
                    userId: session.userId,
                    expiresAt: session.expiresAt,
                },
            },
        },
        OK,
    );
};

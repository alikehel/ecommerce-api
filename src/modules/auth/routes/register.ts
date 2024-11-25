import { CREATED, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import {
    errorResponseSchema,
    successResponseSchema,
} from "@/lib/response-schemas";
import {
    usersInsertSchema,
    usersSelectSchema,
    usersTable,
} from "@/modules/users/schemas";
import type { AppRouteHandler } from "@/types/app-type";
import { createRoute, z } from "@hono/zod-openapi";
import { createSession } from "../lib/create-session";
import { generateSessionToken } from "../lib/generate-session-token";
import { hashPasswordV1 } from "../lib/password";
import { setSessionTokenCookie } from "../lib/set-session-token-cookie";
import { sessionTokenSchema } from "../schemas";

export const registerRoute = createRoute({
    tags: ["Auth"],
    method: "post",
    path: "/api/v1/auth/register",
    summary: "Register",
    description: "Register",
    request: {
        body: jsonContent(usersInsertSchema, "User register"),
    },
    responses: {
        [CREATED]: jsonContent(
            successResponseSchema(
                z.object({
                    user: usersSelectSchema,
                    session: sessionTokenSchema,
                }),
            ),
            "User registered",
        ),
        [UNPROCESSABLE_ENTITY]: jsonContent(
            errorResponseSchema,
            "Validation error",
        ),
    },
});

export const registerHandler: AppRouteHandler<typeof registerRoute> = async (
    c,
) => {
    const data = c.req.valid("json");
    const db = c.var.db;

    const user = await c.var.db.query.usersTable.findFirst({
        where: (usersTable, { eq }) => eq(usersTable.username, data.username),
    });

    if (user) {
        return c.json(
            {
                success: false,
                error: {
                    message: "User already exists",
                },
            },
            UNPROCESSABLE_ENTITY,
        );
    }

    const [newUser] = await c.var.db
        .insert(usersTable)
        .values({
            username: data.username,
            password: await hashPasswordV1(data.password),
            firstName: data.firstName,
            lastName: data.lastName,
        })
        .returning({
            id: usersTable.id,
            username: usersTable.username,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
        });

    const token = generateSessionToken();
    const session = await createSession(db, token, newUser.id);

    setSessionTokenCookie(c, token, session.expiresAt);

    return c.json(
        {
            success: true,
            data: {
                user: newUser,
                session: {
                    token: token,
                    expiresAt: session.expiresAt,
                    userId: session.userId,
                },
            },
        },
        CREATED,
    );
};

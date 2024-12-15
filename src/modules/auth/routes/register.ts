import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { usersTable } from "@/db/schema";
import { CREATED, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { usersInsertSchema, usersSelectSchema } from "@/modules/users/schemas";
import type { AppRouteHandler } from "@/types/app-type";

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
        body: {
            content: {
                "application/json": { schema: usersInsertSchema },
            },
            description: "User Registration",
        },
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
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
    },
});

export const registerHandler: AppRouteHandler<typeof registerRoute> = async (c) => {
    const data = c.req.valid("json");
    const db = c.var.db;

    const user = await c.var.db.query.usersTable.findFirst({
        where: (usersTable, { eq }) => {
            return data.loginWith === "email" ? eq(usersTable.email, data.email) : eq(usersTable.phone, data.phone);
        },
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

    // TODO: Make these a transaction or a batch
    // Insert user
    const [newUser] = await c.var.db
        .insert(usersTable)
        .values({
            email: data.loginWith === "email" ? data.email : data.email,
            phone: data.loginWith === "phone" ? data.phone : data.phone,
            password: await hashPasswordV1(data.password),
            firstName: data.firstName,
            lastName: data.lastName,
        })
        .returning({
            id: usersTable.id,
            email: usersTable.email,
            phone: usersTable.phone,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
            role: usersTable.role,
            verified: usersTable.verified,
            avatar: usersTable.avatar,
            globalId: usersTable.globalId,
            createdAt: usersTable.createdAt,
            updatedAt: usersTable.updatedAt,
            deletedAt: usersTable.deletedAt,
        });
    // Add globalId
    const countryCode = c.req.raw?.cf?.country ?? "XX";
    const id = newUser.id.toString().padStart(10, "0");
    const globalId = `${countryCode}${id}`;
    await c.var.db.update(usersTable).set({ globalId }).where(eq(usersTable.id, newUser.id));

    const token = generateSessionToken();
    const session = await createSession(db, token, newUser.id);

    setSessionTokenCookie(c, token, session.expiresAt);

    return c.json(
        {
            success: true,
            data: {
                user: { ...newUser, globalId },
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

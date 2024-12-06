import { createRoute, z } from "@hono/zod-openapi";
import { and, eq, gte } from "drizzle-orm";

import { tokensTable, usersTable } from "@/db/schema";
import { CREATED, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema } from "@/lib/response-schemas";
import { loginWithSchema, usersInsertSchemaCommon } from "@/modules/users/schemas";
import type { AppRouteHandler } from "@/types/app-type";

import { hashPasswordV1 } from "../lib/password";

export const resetPasswordRoute = createRoute({
    tags: ["Auth"],
    method: "post",
    path: "/api/v1/auth/reset-password",
    summary: "Reset Password",
    description: "Reset Password",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: loginWithSchema.and(
                        z.object({ otp: z.string().length(6), newPassword: usersInsertSchemaCommon.shape.password }),
                    ),
                },
            },
            description: "Reset Password",
        },
    },
    responses: {
        [CREATED]: jsonContent(
            z.object({
                success: z.literal(true),
            }),
            "Password has been reset",
        ),
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
    },
});

export const resetPasswordHandler: AppRouteHandler<typeof resetPasswordRoute> = async (c) => {
    const data = c.req.valid("json");
    const db = c.var.db;

    // Get User
    const user = await c.var.db.query.usersTable.findFirst({
        where: (usersTable, { eq }) => {
            return data.loginWith === "email" ? eq(usersTable.email, data.email) : eq(usersTable.phone, data.phone);
        },
    });
    if (!user) {
        return c.json(
            {
                success: false,
                error: {
                    message: "User not found",
                },
            },
            UNPROCESSABLE_ENTITY,
        );
    }

    // Check OTP
    const [otp] = await db
        .select({
            token: tokensTable.token,
            expiresAt: tokensTable.expiresAt,
        })
        .from(tokensTable)
        .where(
            and(
                eq(tokensTable.userId, user.id),
                eq(tokensTable.token, data.otp),
                gte(tokensTable.expiresAt, new Date()),
            ),
        );
    if (!otp) {
        return c.json(
            {
                success: false,
                error: {
                    message: "Invalid or Expired OTP",
                },
            },
            UNPROCESSABLE_ENTITY,
        );
    }

    // Update Password
    await db
        .update(usersTable)
        .set({
            password: await hashPasswordV1(data.newPassword),
        })
        .where(eq(usersTable.id, user.id));

    // Delete OTP
    await db.delete(tokensTable).where(eq(tokensTable.userId, user.id));

    return c.json(
        {
            success: true,
        },
        CREATED,
    );
};

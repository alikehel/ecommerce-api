import { createRoute, z } from "@hono/zod-openapi";

import { tokensTable } from "@/db/schema";
import { CREATED, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema } from "@/lib/response-schemas";
import { loginWithSchema } from "@/modules/users/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const forgetPasswordRoute = createRoute({
    tags: ["Auth"],
    method: "post",
    path: "/api/v1/auth/forget-password",
    summary: "Forget Password",
    description: "Forget Password",
    request: {
        body: {
            content: {
                "application/json": { schema: loginWithSchema },
            },
            description: "Send OTP to email or phone",
        },
    },
    responses: {
        [CREATED]: jsonContent(
            z.object({
                success: z.literal(true),
                data: z.object({
                    // TODO: Remove otp from response
                    otp: z.string().length(6),
                    expiresAt: z.date(),
                }),
            }),
            "OTP has been sent to your email or phone",
        ),
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
    },
});

export const forgetPasswordHandler: AppRouteHandler<typeof forgetPasswordRoute> = async (c) => {
    const data = c.req.valid("json");
    const db = c.var.db;

    // Check if user exists
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

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 5);

    // Insert OTP
    await db.insert(tokensTable).values({
        userId: user.id,
        token: otp,
        expiresAt: expiresAt,
    });

    // TODO: Send OTP to email or phone
    if (data.loginWith === "email") {
        // Send OTP to email
    } else if (data.loginWith === "phone") {
        // Send OTP to phone
    }

    return c.json(
        {
            success: true,
            // TODO: Remove otp from response
            data: {
                otp,
                expiresAt,
            },
        },
        CREATED,
    );
};

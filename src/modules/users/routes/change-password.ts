import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { NOT_FOUND, OK, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { hashPasswordV1, verifyPasswordV1 } from "@/modules/auth/lib/password";
import { usersInsertSchemaCommon, usersSelectSchema, usersTable } from "@/modules/users/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const changePasswordRoute = createRoute({
    tags: ["Users"],
    method: "patch",
    path: "/api/v1/users/me/password",
    summary: "Update Password",
    description: "Update user password",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        currentPassword: z.string(),
                        newPassword: usersInsertSchemaCommon.shape.password,
                    }),
                },
            },
            description: "User password data",
        },
    },
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    user: usersSelectSchema,
                }),
            ),
            "User updated",
        ),
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "User not found"),
    },
});

export const changePasswordHandler: AppRouteHandler<typeof changePasswordRoute> = async (c) => {
    const data = c.req.valid("json");

    // Check if the current password is correct
    const user = await c.var.db.query.usersTable.findFirst({
        where: (usersTable, { eq }) => eq(usersTable.id, c.var.user.id),
        columns: {
            id: true,
            password: true,
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
            NOT_FOUND,
        );
    }

    if (!(await verifyPasswordV1(data.currentPassword, user.password))) {
        return c.json(
            {
                success: false,
                error: {
                    message: "Current password is incorrect",
                },
            },
            UNPROCESSABLE_ENTITY,
        );
    }

    const [newUser] = await c.var.db
        .update(usersTable)
        .set({
            password: await hashPasswordV1(data.newPassword),
        })
        .where(eq(usersTable.id, c.var.user.id))
        .returning({
            id: usersTable.id,
            email: usersTable.email,
            phone: usersTable.phone,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
            role: usersTable.role,
            verified: usersTable.verified,
            avatar: usersTable.avatar,
        });

    if (!user) {
        return c.json(
            {
                success: false,
                error: {
                    message: "User not found",
                },
            },
            NOT_FOUND,
        );
    }

    return c.json({ success: true, data: { user: newUser } }, OK);
};

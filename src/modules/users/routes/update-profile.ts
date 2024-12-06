import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { NOT_FOUND, OK, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { profileUpdateSchema, usersSelectSchema, usersTable } from "@/modules/users/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const updateProfileRoute = createRoute({
    tags: ["Users' Profile"],
    method: "patch",
    path: "/api/v1/users/me",
    summary: "Update Profile",
    description: "Update Profile",
    request: {
        body: {
            content: {
                "application/json": { schema: profileUpdateSchema },
            },
            description: "User data",
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

export const updateProfileHandler: AppRouteHandler<typeof updateProfileRoute> = async (c) => {
    const data = c.req.valid("json");

    const [user] = await c.var.db
        .update(usersTable)
        .set({
            firstName: data.firstName,
            lastName: data.lastName,
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
            globalId: usersTable.globalId,
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

    return c.json({ success: true, data: { user: user } }, OK);
};

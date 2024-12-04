import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { NOT_FOUND, OK } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { requestParamsSchema } from "@/lib/request-schemas";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { usersSelectSchema, usersTable } from "@/modules/users/schemas";
import { usersParamsSchema } from "@/modules/users/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const deleteUserRoute = createRoute({
    tags: ["Users"],
    method: "delete",
    path: "/api/v1/users/{user_id}",
    summary: "Delete User",
    description: "Delete user by id",
    request: {
        params: requestParamsSchema(
            z.object({
                user_id: usersParamsSchema.shape.id,
            }),
        ),
    },
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    user: usersSelectSchema,
                }),
            ),
            "Delete user",
        ),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "User not found"),
    },
});

export const deleteUserHandler: AppRouteHandler<typeof deleteUserRoute> = async (c) => {
    const pathParams = c.req.valid("param");

    const [user] = await c.var.db.delete(usersTable).where(eq(usersTable.id, pathParams.userId)).returning({
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

    return c.json({ success: true, data: { user: user } }, OK);
};

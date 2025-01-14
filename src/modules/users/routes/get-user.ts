import { createRoute, z } from "@hono/zod-openapi";

import { NOT_FOUND, OK } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { requestParamsSchema } from "@/lib/request-schemas";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { usersParamsSchema, usersSelectSchema } from "@/modules/users/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const getUserRoute = createRoute({
    tags: ["Users"],
    method: "get",
    path: "/api/v1/users/{user_id}",
    summary: "Get User",
    description: "Get user by id",
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
                    user: usersSelectSchema.and(z.object({ balance: z.number() })),
                }),
            ),
            "Get user",
        ),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "User not found"),
    },
});

export const getUserHandler: AppRouteHandler<typeof getUserRoute> = async (c) => {
    const pathParams = c.req.valid("param");

    const user = await c.var.db.query.usersTable.findFirst({
        where: (usersTable, { eq }) => eq(usersTable.id, pathParams.userId),
        columns: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            role: true,
            verified: true,
            balance: true,
            avatar: true,
            globalId: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
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

    return c.json({ success: true, data: { user: user } }, OK);
};

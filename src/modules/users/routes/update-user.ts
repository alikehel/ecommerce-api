import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { usersTable } from "@/db/schema";
import { NOT_FOUND, OK, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { requestParamsSchema } from "@/lib/request-schemas";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { usersParamsSchema, usersSelectSchema, usersUpdateSchema } from "@/modules/users/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const updateUserRoute = createRoute({
    tags: ["Users"],
    method: "patch",
    path: "/api/v1/users/{user_id}",
    summary: "Update User",
    description: "Update user by id",
    request: {
        params: requestParamsSchema(
            z.object({
                user_id: usersParamsSchema.shape.id,
            }),
        ),
        body: {
            content: {
                "application/json": { schema: usersUpdateSchema },
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

export const updateUserHandler: AppRouteHandler<typeof updateUserRoute> = async (c) => {
    const pathParams = c.req.valid("param");
    const data = c.req.valid("json");

    const [user] = await c.var.db
        .update(usersTable)
        .set({
            email: data.email,
            phone: data.phone,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
        })
        .where(eq(usersTable.id, pathParams.userId))
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

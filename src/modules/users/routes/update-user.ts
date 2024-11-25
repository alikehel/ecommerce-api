import { NOT_FOUND, OK, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { requestParamsSchema } from "@/lib/request-schemas";
import {
    errorResponseSchema,
    successResponseSchema,
} from "@/lib/response-schemas";
import {
    usersInsertSchema,
    usersParamsSchema,
    usersSelectSchema,
    usersTable,
} from "@/modules/users/schemas";
import type { AppRouteHandler } from "@/types/app-type";
import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

export const updateUserRoute = createRoute({
    tags: ["Users"],
    method: "patch",
    path: "/api/v1/users/{user_id}",
    summary: "Update user",
    description: "Update user by id",
    request: {
        params: requestParamsSchema(
            z.object({
                user_id: usersParamsSchema.shape.id,
            }),
        ),
        body: jsonContent(usersInsertSchema, "User data"),
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
        [UNPROCESSABLE_ENTITY]: jsonContent(
            errorResponseSchema,
            "Validation error",
        ),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "User not found"),
    },
});

export const updateUserHandler: AppRouteHandler<
    typeof updateUserRoute
> = async (c) => {
    const pathParams = c.req.valid("param");
    const data = c.req.valid("json");

    const [user] = await c.var.db
        .update(usersTable)
        .set({
            username: data.username,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
        })
        .where(eq(usersTable.id, pathParams.userId))
        .returning({
            id: usersTable.id,
            username: usersTable.username,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
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

import {
    CREATED,
    UNAUTHORIZED,
    UNPROCESSABLE_ENTITY,
} from "@/lib/http-status-codes";
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

export const createUserRoute = createRoute({
    tags: ["Users"],
    method: "post",
    path: "/api/v1/users",
    summary: "Create user",
    description: "Create a new user",
    request: {
        body: jsonContent(usersInsertSchema, "User data"),
    },
    responses: {
        [CREATED]: jsonContent(
            successResponseSchema(
                z.object({
                    user: usersSelectSchema,
                }),
            ),
            "User created",
        ),
        [UNAUTHORIZED]: jsonContent(errorResponseSchema, "Unauthorized"),
        [UNPROCESSABLE_ENTITY]: jsonContent(
            errorResponseSchema,
            "Validation error",
        ),
    },
});

export const createUserHandler: AppRouteHandler<
    typeof createUserRoute
> = async (c) => {
    const data = c.req.valid("json");

    const [user] = await c.var.db
        .insert(usersTable)
        .values({
            username: data.username,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
        })
        .returning({
            id: usersTable.id,
            username: usersTable.username,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
        });

    return c.json({ success: true, data: { user: user } }, CREATED);
};

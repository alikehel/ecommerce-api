import { createRoute, z } from "@hono/zod-openapi";

import { CREATED, UNAUTHORIZED, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { usersInsertSchema, usersSelectSchema, usersTable } from "@/modules/users/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const createUserRoute = createRoute({
    tags: ["Users"],
    method: "post",
    path: "/api/v1/users",
    summary: "Create user",
    description: "Create a new user",
    request: {
        body: {
            content: {
                "application/json": { schema: usersInsertSchema },
            },
            description: "User data",
        },
        // body: jsonContent(usersInsertSchema, "User data"),
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
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
    },
});

export const createUserHandler: AppRouteHandler<typeof createUserRoute> = async (c) => {
    const data = c.req.valid("json");

    const [user] = await c.var.db
        .insert(usersTable)
        .values({
            email: data.loginWith === "email" ? data.email : null,
            phone: data.loginWith === "phone" ? data.phone : null,
            password: data.password,
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
        });

    return c.json({ success: true, data: { user: user } }, CREATED);
};

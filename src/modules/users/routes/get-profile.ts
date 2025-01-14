import { createRoute, z } from "@hono/zod-openapi";

import { NOT_FOUND, OK } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { usersSelectSchema } from "@/modules/users/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const getProfileRoute = createRoute({
    tags: ["Users' Profile"],
    method: "get",
    path: "/api/v1/users/me",
    summary: "Get Profile",
    description: "Get Profile of the current user",
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    user: usersSelectSchema,
                }),
            ),
            "Get user",
        ),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "User not found"),
    },
});

export const getProfileHandler: AppRouteHandler<typeof getProfileRoute> = async (c) => {
    const user = c.var.user;

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

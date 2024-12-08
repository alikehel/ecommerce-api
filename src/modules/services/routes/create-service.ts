import { createRoute, z } from "@hono/zod-openapi";

import { servicesTable } from "@/db/schema";
import { CREATED, UNAUTHORIZED, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { servicesInsertSchema, servicesSelectSchema } from "@/modules/services/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const createServiceRoute = createRoute({
    tags: ["Services"],
    method: "post",
    path: "/api/v1/services",
    summary: "Create Service",
    description: "Create a new service",
    request: {
        body: {
            content: {
                "application/json": { schema: servicesInsertSchema },
            },
            description: "Service data",
        },
        // body: jsonContent(servicesInsertSchema, "Service data"),
    },
    responses: {
        [CREATED]: jsonContent(
            successResponseSchema(
                z.object({
                    service: servicesSelectSchema,
                }),
            ),
            "Service created",
        ),
        [UNAUTHORIZED]: jsonContent(errorResponseSchema, "Unauthorized"),
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
    },
});

export const createServiceHandler: AppRouteHandler<typeof createServiceRoute> = async (c) => {
    const data = c.req.valid("json");

    const [service] = await c.var.db
        .insert(servicesTable)
        .values({
            name: data.name,
            description: data.description,
            price: data.price,
            categoryId: data.categoryId,
            userId: c.var.user.id,
        })
        .returning();

    return c.json({ success: true, data: { service: service } }, CREATED);
};

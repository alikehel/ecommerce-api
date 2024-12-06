import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { servicesTable } from "@/db/schema";
import { NOT_FOUND, OK, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { requestParamsSchema } from "@/lib/request-schemas";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { servicesParamsSchema, servicesSelectSchema, servicesUpdateSchema } from "@/modules/services/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const updateServiceRoute = createRoute({
    tags: ["Services"],
    method: "patch",
    path: "/api/v1/services/{service_id}",
    summary: "Update Service",
    description: "Update service by id",
    request: {
        params: requestParamsSchema(
            z.object({
                service_id: servicesParamsSchema.shape.id,
            }),
        ),
        body: {
            content: {
                "application/json": { schema: servicesUpdateSchema },
            },
            description: "Service data",
        },
    },
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    service: servicesSelectSchema,
                }),
            ),
            "Service updated",
        ),
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "Service not found"),
    },
});

export const updateServiceHandler: AppRouteHandler<typeof updateServiceRoute> = async (c) => {
    const pathParams = c.req.valid("param");
    const data = c.req.valid("json");

    const [service] = await c.var.db
        .update(servicesTable)
        .set({
            name: data.name,
            description: data.description,
            price: data.price,
            categoryId: data.categoryId,
        })
        .where(eq(servicesTable.id, pathParams.serviceId))
        .returning();

    if (!service) {
        return c.json(
            {
                success: false,
                error: {
                    message: "Service not found",
                },
            },
            NOT_FOUND,
        );
    }

    return c.json({ success: true, data: { service: service } }, OK);
};

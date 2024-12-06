import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { servicesTable } from "@/db/schema";
import { NOT_FOUND, OK } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { requestParamsSchema } from "@/lib/request-schemas";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { servicesParamsSchema, servicesSelectSchema } from "@/modules/services/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const deleteServiceRoute = createRoute({
    tags: ["Services"],
    method: "delete",
    path: "/api/v1/services/{service_id}",
    summary: "Delete Service",
    description: "Delete service by id",
    request: {
        params: requestParamsSchema(
            z.object({
                service_id: servicesParamsSchema.shape.id,
            }),
        ),
    },
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    service: servicesSelectSchema.pick({ id: true }),
                }),
            ),
            "Delete service",
        ),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "Service not found"),
    },
});

export const deleteServiceHandler: AppRouteHandler<typeof deleteServiceRoute> = async (c) => {
    const pathParams = c.req.valid("param");

    const [service] = await c.var.db.delete(servicesTable).where(eq(servicesTable.id, pathParams.serviceId)).returning({
        id: servicesTable.id,
    });

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

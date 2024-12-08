import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { servicesTable } from "@/db/schema";
import { NOT_FOUND, OK } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { requestParamsSchema } from "@/lib/request-schemas";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { servicesParamsSchema, servicesSelectSchema } from "@/modules/services/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const getServiceRoute = createRoute({
    tags: ["Services"],
    method: "get",
    path: "/api/v1/services/{service_id}",
    summary: "Get Service",
    description: "Get service by id",
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
                    service: servicesSelectSchema,
                }),
            ),
            "Get service",
        ),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "Service not found"),
    },
});

export const getServiceHandler: AppRouteHandler<typeof getServiceRoute> = async (c) => {
    const pathParams = c.req.valid("param");

    const [service] = await c.var.db
        .select({
            id: servicesTable.id,
            name: servicesTable.name,
            description: servicesTable.description,
            price: servicesTable.price,
            categoryId: servicesTable.categoryId,
            mainImage: servicesTable.mainImage,
            images: servicesTable.images,
            active: servicesTable.active,
            createdAt: servicesTable.createdAt,
            updatedAt: servicesTable.updatedAt,
            deletedAt: servicesTable.deletedAt,
            userId: servicesTable.userId,
        })
        .from(servicesTable)
        .where(eq(servicesTable.id, pathParams.serviceId))
        .limit(1);

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

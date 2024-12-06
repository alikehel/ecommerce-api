import { createRoute, z } from "@hono/zod-openapi";
import { type AnyColumn, and, asc, desc, eq } from "drizzle-orm";

import { servicesTable } from "@/db/schema";
import { NOT_FOUND, OK } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { calculateOffset, calculatePagesCount } from "@/lib/pagination";
import { requestParamsWithPaginationSchema } from "@/lib/request-schemas";
import {
    errorResponseSchema,
    paginationResponseSchema,
    type paginationResponseType,
    successResponseSchema,
} from "@/lib/response-schemas";
import { servicesParamsSchema, servicesSelectSchema } from "@/modules/services/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const getServicesRoute = createRoute({
    tags: ["Services"],
    method: "get",
    path: "/api/v1/services",
    summary: "Get All Services",
    description: "Get all services",
    request: {
        query: requestParamsWithPaginationSchema(
            z.object({
                service_id: servicesParamsSchema.shape.id.optional(),
                name: servicesParamsSchema.shape.name.optional(),
                category_id: servicesParamsSchema.shape.categoryId.optional(),
                active: servicesParamsSchema.shape.active.optional(),
            }),
            Object.keys({
                ...servicesParamsSchema.shape,
            }),
        ),
    },
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    services: z.array(servicesSelectSchema),
                    pagination: paginationResponseSchema,
                }),
            ),
            "Get all services",
        ),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "No services found"),
    },
});

export const getServicesHandler: AppRouteHandler<typeof getServicesRoute> = async (c) => {
    const queryParams = c.req.valid("query");

    const where = and(
        queryParams.serviceId ? eq(servicesTable.id, queryParams.serviceId) : undefined,
        queryParams.name ? eq(servicesTable.name, queryParams.name) : undefined,
        queryParams.categoryId ? eq(servicesTable.categoryId, queryParams.categoryId) : undefined,
        queryParams.active ? eq(servicesTable.active, queryParams.active) : undefined,
    );

    const totalItemsCount = await c.var.db.$count(servicesTable, where);

    const totalPagesCount = calculatePagesCount(totalItemsCount, queryParams.pageSize);

    if (queryParams.page > totalPagesCount) {
        queryParams.page = totalPagesCount;
    }

    const services = await c.var.db
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
        })
        .from(servicesTable)
        .where(where)
        .orderBy(
            queryParams.sortingOrder === "asc"
                ? asc(servicesTable[queryParams.sortingField as keyof typeof servicesTable] as AnyColumn)
                : desc(servicesTable.id),
        )
        .limit(queryParams.pageSize)
        .offset(calculateOffset(queryParams.page, queryParams.pageSize));

    const pagination = {
        currentPage: queryParams.page,
        totalPagesCount: totalPagesCount,
        itemsPerPage: queryParams.pageSize < totalItemsCount ? queryParams.pageSize : totalItemsCount,
        totalItemsCount: totalItemsCount,
    } satisfies paginationResponseType;

    return c.json(
        {
            success: true,
            data: {
                services: services,
                pagination: pagination,
            },
        },
        OK,
    );
};

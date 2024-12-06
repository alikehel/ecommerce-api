import { createRoute, z } from "@hono/zod-openapi";
import { type AnyColumn, and, asc, desc, eq } from "drizzle-orm";

import { categoriesTable } from "@/db/schema";
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
import { categoriesParamsSchema, categoriesSelectSchema } from "@/modules/categories/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const getCategoriesRoute = createRoute({
    tags: ["Categories"],
    method: "get",
    path: "/api/v1/categories",
    summary: "Get All Categories",
    description: "Get all categories",
    request: {
        query: requestParamsWithPaginationSchema(
            z.object({
                category_id: categoriesParamsSchema.shape.id.optional(),
                name: categoriesParamsSchema.shape.name.optional(),
                type: categoriesParamsSchema.shape.type.optional(),
            }),
            Object.keys({
                ...categoriesParamsSchema.shape,
            }),
        ),
    },
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    categories: z.array(categoriesSelectSchema),
                    pagination: paginationResponseSchema,
                }),
            ),
            "Get all categories",
        ),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "No categories found"),
    },
});

export const getCategoriesHandler: AppRouteHandler<typeof getCategoriesRoute> = async (c) => {
    const queryParams = c.req.valid("query");

    const where = and(
        queryParams.categoryId ? eq(categoriesTable.id, queryParams.categoryId) : undefined,
        queryParams.name ? eq(categoriesTable.name, queryParams.name) : undefined,
        queryParams.type ? eq(categoriesTable.type, queryParams.type) : undefined,
    );

    const totalItemsCount = await c.var.db.$count(categoriesTable, where);

    const totalPagesCount = calculatePagesCount(totalItemsCount, queryParams.pageSize);

    if (queryParams.page > totalPagesCount) {
        queryParams.page = totalPagesCount;
    }

    const categories = await c.var.db
        .select({
            id: categoriesTable.id,
            name: categoriesTable.name,
            description: categoriesTable.description,
            type: categoriesTable.type,
            createdAt: categoriesTable.createdAt,
            updatedAt: categoriesTable.updatedAt,
            deletedAt: categoriesTable.deletedAt,
        })
        .from(categoriesTable)
        .where(where)
        .orderBy(
            queryParams.sortingOrder === "asc"
                ? asc(categoriesTable[queryParams.sortingField as keyof typeof categoriesTable] as AnyColumn)
                : desc(categoriesTable.id),
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
                categories: categories,
                pagination: pagination,
            },
        },
        OK,
    );
};

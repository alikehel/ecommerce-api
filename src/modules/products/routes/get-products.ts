import { createRoute, z } from "@hono/zod-openapi";
import { type AnyColumn, and, asc, desc, eq } from "drizzle-orm";

import { productsTable } from "@/db/schema";
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
import { productsParamsSchema, productsSelectSchema } from "@/modules/products/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const getProductsRoute = createRoute({
    tags: ["Products"],
    method: "get",
    path: "/api/v1/products",
    summary: "Get All Products",
    description: "Get all products",
    request: {
        query: requestParamsWithPaginationSchema(
            z.object({
                product_id: productsParamsSchema.shape.id.optional(),
                name: productsParamsSchema.shape.name.optional(),
                stock: productsParamsSchema.shape.stock.optional(),
                category_id: productsParamsSchema.shape.categoryId.optional(),
                active: productsParamsSchema.shape.active.optional(),
                user_id: productsParamsSchema.shape.userId.optional(),
            }),
            Object.keys({
                ...productsParamsSchema.shape,
            }),
        ),
    },
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    products: z.array(productsSelectSchema),
                    pagination: paginationResponseSchema,
                }),
            ),
            "Get all products",
        ),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "No products found"),
    },
});

export const getProductsHandler: AppRouteHandler<typeof getProductsRoute> = async (c) => {
    const queryParams = c.req.valid("query");

    const where = and(
        queryParams.productId ? eq(productsTable.id, queryParams.productId) : undefined,
        queryParams.name ? eq(productsTable.name, queryParams.name) : undefined,
        queryParams.stock ? eq(productsTable.stock, queryParams.stock) : undefined,
        queryParams.categoryId ? eq(productsTable.categoryId, queryParams.categoryId) : undefined,
        queryParams.active ? eq(productsTable.active, queryParams.active) : undefined,
        queryParams.userId ? eq(productsTable.userId, queryParams.userId) : undefined,
    );

    const totalItemsCount = await c.var.db.$count(productsTable, where);

    const totalPagesCount = calculatePagesCount(totalItemsCount, queryParams.pageSize);

    if (queryParams.page > totalPagesCount) {
        queryParams.page = totalPagesCount;
    }

    const products = await c.var.db
        .select({
            id: productsTable.id,
            name: productsTable.name,
            description: productsTable.description,
            price: productsTable.price,
            stock: productsTable.stock,
            categoryId: productsTable.categoryId,
            mainImage: productsTable.mainImage,
            images: productsTable.images,
            active: productsTable.active,
            createdAt: productsTable.createdAt,
            updatedAt: productsTable.updatedAt,
            deletedAt: productsTable.deletedAt,
            userId: productsTable.userId,
        })
        .from(productsTable)
        .where(where)
        .orderBy(
            queryParams.sortingOrder === "asc"
                ? asc(productsTable[queryParams.sortingField as keyof typeof productsTable] as AnyColumn)
                : desc(productsTable.id),
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
                products: products,
                pagination: pagination,
            },
        },
        OK,
    );
};

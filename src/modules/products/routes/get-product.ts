import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { productsTable } from "@/db/schema";
import { NOT_FOUND, OK } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { requestParamsSchema } from "@/lib/request-schemas";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { productsParamsSchema, productsSelectSchema } from "@/modules/products/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const getProductRoute = createRoute({
    tags: ["Products"],
    method: "get",
    path: "/api/v1/products/{product_id}",
    summary: "Get Product",
    description: "Get product by id",
    request: {
        params: requestParamsSchema(
            z.object({
                product_id: productsParamsSchema.shape.id,
            }),
        ),
    },
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    product: productsSelectSchema,
                }),
            ),
            "Get product",
        ),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "Product not found"),
    },
});

export const getProductHandler: AppRouteHandler<typeof getProductRoute> = async (c) => {
    const pathParams = c.req.valid("param");

    const [product] = await c.var.db
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
        .where(eq(productsTable.id, pathParams.productId))
        .limit(1);

    if (!product) {
        return c.json(
            {
                success: false,
                error: {
                    message: "Product not found",
                },
            },
            NOT_FOUND,
        );
    }

    return c.json({ success: true, data: { product: product } }, OK);
};

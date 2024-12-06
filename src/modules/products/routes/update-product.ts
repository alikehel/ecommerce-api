import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { productsTable } from "@/db/schema";
import { NOT_FOUND, OK, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { requestParamsSchema } from "@/lib/request-schemas";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { productsParamsSchema, productsSelectSchema, productsUpdateSchema } from "@/modules/products/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const updateProductRoute = createRoute({
    tags: ["Products"],
    method: "patch",
    path: "/api/v1/products/{product_id}",
    summary: "Update Product",
    description: "Update product by id",
    request: {
        params: requestParamsSchema(
            z.object({
                product_id: productsParamsSchema.shape.id,
            }),
        ),
        body: {
            content: {
                "application/json": { schema: productsUpdateSchema },
            },
            description: "Product data",
        },
    },
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    product: productsSelectSchema,
                }),
            ),
            "Product updated",
        ),
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "Product not found"),
    },
});

export const updateProductHandler: AppRouteHandler<typeof updateProductRoute> = async (c) => {
    const pathParams = c.req.valid("param");
    const data = c.req.valid("json");

    const [product] = await c.var.db
        .update(productsTable)
        .set({
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            categoryId: data.categoryId,
        })
        .where(eq(productsTable.id, pathParams.productId))
        .returning();

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

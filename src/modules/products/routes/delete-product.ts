import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { productsTable } from "@/db/schema";
import { NOT_FOUND, OK } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { requestParamsSchema } from "@/lib/request-schemas";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { productsParamsSchema, productsSelectSchema } from "@/modules/products/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const deleteProductRoute = createRoute({
    tags: ["Products"],
    method: "delete",
    path: "/api/v1/products/{product_id}",
    summary: "Delete Product",
    description: "Delete product by id",
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
                    product: productsSelectSchema.pick({ id: true }),
                }),
            ),
            "Delete product",
        ),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "Product not found"),
    },
});

export const deleteProductHandler: AppRouteHandler<typeof deleteProductRoute> = async (c) => {
    const pathParams = c.req.valid("param");

    const [product] = await c.var.db.delete(productsTable).where(eq(productsTable.id, pathParams.productId)).returning({
        id: productsTable.id,
    });

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

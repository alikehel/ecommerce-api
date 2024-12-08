import { createRoute, z } from "@hono/zod-openapi";

import { productsTable } from "@/db/schema";
import { CREATED, UNAUTHORIZED, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { productsInsertSchema, productsSelectSchema } from "@/modules/products/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const createProductRoute = createRoute({
    tags: ["Products"],
    method: "post",
    path: "/api/v1/products",
    summary: "Create Product",
    description: "Create a new product",
    request: {
        body: {
            content: {
                "application/json": { schema: productsInsertSchema },
            },
            description: "Product data",
        },
        // body: jsonContent(productsInsertSchema, "Product data"),
    },
    responses: {
        [CREATED]: jsonContent(
            successResponseSchema(
                z.object({
                    product: productsSelectSchema,
                }),
            ),
            "Product created",
        ),
        [UNAUTHORIZED]: jsonContent(errorResponseSchema, "Unauthorized"),
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
    },
});

export const createProductHandler: AppRouteHandler<typeof createProductRoute> = async (c) => {
    const data = c.req.valid("json");

    const [product] = await c.var.db
        .insert(productsTable)
        .values({
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            categoryId: data.categoryId,
            userId: c.var.user.id,
        })
        .returning();

    return c.json({ success: true, data: { product: product } }, CREATED);
};

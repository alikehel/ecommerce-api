import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { categoriesTable } from "@/db/schema";
import { NOT_FOUND, OK } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { requestParamsSchema } from "@/lib/request-schemas";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { categoriesParamsSchema, categoriesSelectSchema } from "@/modules/categories/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const deleteCategoryRoute = createRoute({
    tags: ["Categories"],
    method: "delete",
    path: "/api/v1/categories/{category_id}",
    summary: "Delete Category",
    description: "Delete category by id",
    request: {
        params: requestParamsSchema(
            z.object({
                category_id: categoriesParamsSchema.shape.id,
            }),
        ),
    },
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    category: categoriesSelectSchema.pick({ id: true }),
                }),
            ),
            "Delete category",
        ),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "Category not found"),
    },
});

export const deleteCategoryHandler: AppRouteHandler<typeof deleteCategoryRoute> = async (c) => {
    const pathParams = c.req.valid("param");

    const [category] = await c.var.db
        .delete(categoriesTable)
        .where(eq(categoriesTable.id, pathParams.categoryId))
        .returning({
            id: categoriesTable.id,
        });

    if (!category) {
        return c.json(
            {
                success: false,
                error: {
                    message: "Category not found",
                },
            },
            NOT_FOUND,
        );
    }

    return c.json({ success: true, data: { category: category } }, OK);
};

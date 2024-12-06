import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { categoriesTable } from "@/db/schema";
import { NOT_FOUND, OK, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { requestParamsSchema } from "@/lib/request-schemas";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { categoriesParamsSchema, categoriesSelectSchema, categoriesUpdateSchema } from "@/modules/categories/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const updateCategoryRoute = createRoute({
    tags: ["Categories"],
    method: "patch",
    path: "/api/v1/categories/{category_id}",
    summary: "Update Category",
    description: "Update category by id",
    request: {
        params: requestParamsSchema(
            z.object({
                category_id: categoriesParamsSchema.shape.id,
            }),
        ),
        body: {
            content: {
                "application/json": { schema: categoriesUpdateSchema },
            },
            description: "Category data",
        },
    },
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    category: categoriesSelectSchema,
                }),
            ),
            "Category updated",
        ),
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "Category not found"),
    },
});

export const updateCategoryHandler: AppRouteHandler<typeof updateCategoryRoute> = async (c) => {
    const pathParams = c.req.valid("param");
    const data = c.req.valid("json");

    const [category] = await c.var.db
        .update(categoriesTable)
        .set({
            name: data.name,
            description: data.description,
            type: data.type,
        })
        .where(eq(categoriesTable.id, pathParams.categoryId))
        .returning();

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

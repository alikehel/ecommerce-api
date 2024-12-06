import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { categoriesTable } from "@/db/schema";
import { NOT_FOUND, OK } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { requestParamsSchema } from "@/lib/request-schemas";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { categoriesParamsSchema, categoriesSelectSchema } from "@/modules/categories/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const getCategoryRoute = createRoute({
    tags: ["Categories"],
    method: "get",
    path: "/api/v1/categories/{category_id}",
    summary: "Get Category",
    description: "Get category by id",
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
                    category: categoriesSelectSchema,
                }),
            ),
            "Get category",
        ),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "Category not found"),
    },
});

export const getCategoryHandler: AppRouteHandler<typeof getCategoryRoute> = async (c) => {
    const pathParams = c.req.valid("param");

    const [category] = await c.var.db
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
        .where(eq(categoriesTable.id, pathParams.categoryId))
        .limit(1);

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

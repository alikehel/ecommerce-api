import { createRoute, z } from "@hono/zod-openapi";

import { categoriesTable } from "@/db/schema";
import { CREATED, UNAUTHORIZED, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { categoriesInsertSchema, categoriesSelectSchema } from "@/modules/categories/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const createCategoryRoute = createRoute({
    tags: ["Categories"],
    method: "post",
    path: "/api/v1/categories",
    summary: "Create Category",
    description: "Create a new category",
    request: {
        body: {
            content: {
                "application/json": { schema: categoriesInsertSchema },
            },
            description: "Category data",
        },
        // body: jsonContent(categoriesInsertSchema, "Category data"),
    },
    responses: {
        [CREATED]: jsonContent(
            successResponseSchema(
                z.object({
                    category: categoriesSelectSchema,
                }),
            ),
            "Category created",
        ),
        [UNAUTHORIZED]: jsonContent(errorResponseSchema, "Unauthorized"),
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
    },
});

export const createCategoryHandler: AppRouteHandler<typeof createCategoryRoute> = async (c) => {
    const data = c.req.valid("json");

    const [category] = await c.var.db
        .insert(categoriesTable)
        .values({
            name: data.name,
            description: data.description,
            type: data.type,
        })
        .returning();

    return c.json({ success: true, data: { category: category } }, CREATED);
};

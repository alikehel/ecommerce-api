import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { categoriesTable } from "@/db/schema";

export const categoriesInsertSchema = createInsertSchema(categoriesTable, {
    type: z.enum(["product", "service", "general"]),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
});

export const categoriesSelectSchema = createSelectSchema(categoriesTable);

export const categoriesUpdateSchema = categoriesInsertSchema.partial();

export const categoriesParamsSchema = createSelectSchema(categoriesTable, {
    id: z.coerce.number(),
    type: z.enum(["product", "service", "general"]).optional(),
});

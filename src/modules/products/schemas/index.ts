import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { productsTable } from "@/db/schema";

export const productsInsertSchema = createInsertSchema(productsTable).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    mainImage: true,
    images: true,
});

export const productsSelectSchema = createSelectSchema(productsTable, {
    images: z.array(z.string()).default([]),
});

export const productsUpdateSchema = productsInsertSchema.partial();

export const productsParamsSchema = createSelectSchema(productsTable, {
    id: z.coerce.number(),
});

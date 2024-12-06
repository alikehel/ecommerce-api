import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { servicesTable } from "@/db/schema";

export const servicesInsertSchema = createInsertSchema(servicesTable).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    images: true,
    mainImage: true,
});

export const servicesSelectSchema = createSelectSchema(servicesTable, {
    images: z.array(z.string()).default([]),
});

export const servicesUpdateSchema = servicesInsertSchema.partial();

export const servicesParamsSchema = createSelectSchema(servicesTable, {
    id: z.coerce.number(),
});

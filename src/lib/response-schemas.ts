import type { ZodSchema } from "@/types/zod-schema";
import { z } from "@hono/zod-openapi";

export const successResponseSchema = <T extends ZodSchema>(schema: T) => {
    return z.object({
        success: z.boolean().openapi({
            example: true,
        }),
        data: schema,
    });
};

export const errorResponseSchema = z.object({
    success: z.boolean().openapi({
        example: false,
    }),
    error: z.object({
        message: z.string(),
    }),
});

export type errorResponseType = z.infer<typeof errorResponseSchema>;

export const paginationResponseSchema = z.object({
    currentPage: z.number(),
    itemsPerPage: z.number(),
    totalPagesCount: z.number(),
    totalItemsCount: z.number(),
});

export type paginationResponseType = z.infer<typeof paginationResponseSchema>;

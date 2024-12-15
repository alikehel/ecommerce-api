import { z } from "zod";

export const sendSchema = z.object({
    recipientId: z.number().int().positive(),
    amount: z.number().int().positive(),
});

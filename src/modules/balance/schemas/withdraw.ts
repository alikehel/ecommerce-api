import { z } from "zod";

const withdrawCommonSchema = z.object({
    amount: z.number().int().positive(),
});

const bankSchema = z.object({
    destination: z.literal("bank"),
    bankAccount: z.string().regex(/^\d{9,18}$/, "Bank account must be 9 to 18 digits"),
});

const walletSchema = z.object({
    destination: z.literal("wallet"),
    walletId: z.string().min(1, "Wallet ID is required"),
});

export const withdrawSchema = z.discriminatedUnion("destination", [bankSchema, walletSchema]).and(withdrawCommonSchema);

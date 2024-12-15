import { z } from "zod";

import { luhnCheck } from "../lib/luhn-check";
import { validateExpiryDate } from "../lib/validate-expiry-date";

// Common fields
export const paymentCommonSchema = z.object({
    amount: z.number().int().positive(),
});

const cardSchema = z.object({
    type: z.literal("card"),
    cardNumber: z
        .string()
        .regex(/^\d{16}$/, "Card number must be 16 digits")
        .refine((num) => luhnCheck(num), {
            message: "Invalid card number.",
        }),
    cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
    holderName: z.string().trim().min(1, "Holder name is required"),
    expiryDate: z
        .string()
        .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format")
        .refine(validateExpiryDate, {
            message: "Expiry date must be in the future.",
        }),
});

const paypalSchema = z.object({
    type: z.literal("paypal"),
    email: z.string().email("Invalid PayPal email address"),
});

// Discriminated union schema
export const paymentSchema = z.discriminatedUnion("type", [cardSchema, paypalSchema]).and(paymentCommonSchema);

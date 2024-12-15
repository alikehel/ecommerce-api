import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { increment } from "@/db/lib/utils";
import { usersTable } from "@/db/schema";
import { OK, UNAUTHORIZED, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import type { AppRouteHandler } from "@/types/app-type";

import { paymentSchema } from "../schemas/deposit";

export const depositBalanceRoute = createRoute({
    tags: ["Balance"],
    method: "post",
    path: "/api/v1/balance/deposit",
    summary: "Deposit Balance",
    description: "Deposit balance to the user account",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: paymentSchema,
                },
            },
            description: "Balance deposit data",
        },
    },
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    // TODO: Add balance schema from users/schemas/index.ts
                    balance: z.number().int().positive(),
                }),
            ),
            "Balance deposited successfully",
        ),
        [UNAUTHORIZED]: jsonContent(errorResponseSchema, "Unauthorized"),
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
    },
});

export const depositBalanceHandler: AppRouteHandler<typeof depositBalanceRoute> = async (c) => {
    const data = c.req.valid("json");

    // TODO: STEP 1: Implement the logic to deposit balance based on the payment type

    // STEP 2: Update the user's balance in the database
    const [user] = await c.var.db
        .update(usersTable)
        .set({
            balance: increment(usersTable.balance, data.amount),
        })
        .where(eq(usersTable.id, c.var.user.id))
        .returning({
            balance: usersTable.balance,
        });

    // STEP 3: Return the updated balance in the response
    return c.json({ success: true, data: { balance: user.balance } }, OK);
};

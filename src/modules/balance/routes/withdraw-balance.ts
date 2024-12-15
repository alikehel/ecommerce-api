import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { decrement } from "@/db/lib/utils";
import { usersTable } from "@/db/schema";
import { OK, UNAUTHORIZED, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import type { AppRouteHandler } from "@/types/app-type";

import { withdrawSchema } from "../schemas/withdraw";

export const withdrawBalanceRoute = createRoute({
    tags: ["Balance"],
    method: "post",
    path: "/api/v1/balance/withdraw",
    summary: "Withdraw Balance",
    description: "Withdraw balance from the user account",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: withdrawSchema,
                },
            },
            description: "Withdraw balance request",
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
            "Balance withdrawed successfully",
        ),
        [UNAUTHORIZED]: jsonContent(errorResponseSchema, "Unauthorized"),
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
    },
});

export const withdrawBalanceHandler: AppRouteHandler<typeof withdrawBalanceRoute> = async (c) => {
    const data = c.req.valid("json");

    // STEP 1: Implement the logic to check if the user has enough balance to withdraw
    const user = await c.var.db.query.usersTable.findFirst({
        where: (usersTable, { eq }) => eq(usersTable.id, c.var.user.id),
        columns: {
            balance: true,
        },
    });
    if (!user) {
        return c.json(
            {
                success: false,
                error: {
                    message: "User not found",
                },
            },
            UNAUTHORIZED,
        );
    }
    if (user.balance < data.amount) {
        return c.json(
            {
                success: false,
                error: {
                    message: "Insufficient balance",
                },
            },
            UNPROCESSABLE_ENTITY,
        );
    }

    // TODO: STEP 2: Implement the logic to withdraw balance from the user account

    // STEP 3: Update the user's balance in the database
    const [newUser] = await c.var.db
        .update(usersTable)
        .set({
            balance: decrement(usersTable.balance, data.amount),
        })
        .where(eq(usersTable.id, c.var.user.id))
        .returning({
            balance: usersTable.balance,
        });

    // STEP 4: Return the updated balance in the response
    return c.json({ success: true, data: { balance: newUser.balance } }, OK);
};

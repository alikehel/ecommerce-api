import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { decrement, increment } from "@/db/lib/utils";
import { usersTable } from "@/db/schema";
import { OK, UNAUTHORIZED, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import type { AppRouteHandler } from "@/types/app-type";

import { sendSchema } from "../schemas/send";

export const sendBalanceRoute = createRoute({
    tags: ["Balance"],
    method: "post",
    path: "/api/v1/balance/send",
    summary: "Send Balance",
    description: "Send balance to another user account",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: sendSchema,
                },
            },
            description: "Send balance request",
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
            "Balance sent successfully",
        ),
        [UNAUTHORIZED]: jsonContent(errorResponseSchema, "Unauthorized"),
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
    },
});

export const sendBalanceHandler: AppRouteHandler<typeof sendBalanceRoute> = async (c) => {
    const data = c.req.valid("json");

    // STEP 1: Implement the logic to check if the user has enough balance to send
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

    // STEP 2: Check if the recipient exists and it's not the same user
    const recipient = await c.var.db.query.usersTable.findFirst({
        where: (usersTable, { eq }) => eq(usersTable.id, data.recipientId),
    });
    if (!recipient) {
        return c.json(
            {
                success: false,
                error: {
                    message: "Recipient not found",
                },
            },
            UNPROCESSABLE_ENTITY,
        );
    }
    if (recipient.id === c.var.user.id) {
        return c.json(
            {
                success: false,
                error: {
                    message: "Cannot send balance to yourself",
                },
            },
            UNPROCESSABLE_ENTITY,
        );
    }

    // STEP 3: Implement the logic to send balance to another user account (must be atomic)
    const [[sender]] = await c.var.db.batch([
        c.var.db
            .update(usersTable)
            .set({
                balance: decrement(usersTable.balance, data.amount),
            })
            .where(eq(usersTable.id, c.var.user.id))
            .returning({
                balance: usersTable.balance,
            }),
        c.var.db
            .update(usersTable)
            .set({
                balance: increment(usersTable.balance, data.amount),
            })
            .where(eq(usersTable.id, data.recipientId))
            .returning({
                balance: usersTable.balance,
            }),
    ]);

    // STEP 4: Return the updated balance in the response
    return c.json({ success: true, data: { balance: sender.balance } }, OK);
};

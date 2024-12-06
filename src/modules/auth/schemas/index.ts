import { z } from "@hono/zod-openapi";
import type { InferSelectModel } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";

import { sessionsTable } from "@/db/schema";
import { type User } from "@/modules/users/schemas";

export const sessionSelectSchema = createSelectSchema(sessionsTable);

export const sessionTokenSchema = sessionSelectSchema
    .pick({
        userId: true,
        expiresAt: true,
    })
    .extend({
        token: z.string(),
    });

export type Session = Pick<InferSelectModel<typeof sessionsTable>, "id" | "userId" | "expiresAt">;

export type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };

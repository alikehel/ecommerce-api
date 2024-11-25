import { type User, usersTable } from "@/modules/users/schemas";
import { z } from "@hono/zod-openapi";
import type { InferSelectModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";

export const sessionsTable = sqliteTable("sessions", {
    id: text().primaryKey(),
    userId: int()
        .notNull()
        .references(() => usersTable.id),
    expiresAt: int({
        mode: "timestamp",
    }).notNull(),
});

export const sessionSelectSchema = createSelectSchema(sessionsTable);

export const sessionTokenSchema = sessionSelectSchema
    .pick({
        userId: true,
        expiresAt: true,
    })
    .extend({
        token: z.string(),
    });

export type Session = InferSelectModel<typeof sessionsTable>;

export type SessionValidationResult =
    | { session: Session; user: User }
    | { session: null; user: null };

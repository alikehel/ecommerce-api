import { z } from "@hono/zod-openapi";
import type { InferSelectModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const usersTable = sqliteTable("users", {
    id: int().primaryKey({ autoIncrement: true }),
    username: text().notNull().unique(),
    password: text().notNull(),
    firstName: text().notNull(),
    lastName: text().notNull(),
});

export type User = Pick<
    InferSelectModel<typeof usersTable>,
    "id" | "username" | "firstName" | "lastName"
>;

export const usersInsertSchema = createInsertSchema(usersTable, {
    username: z
        .string()
        .regex(
            /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/gim,
            "Username can only contain lowercase letters (a-z), numbers (0-9), underscores, and periods. They must not start or end with a period, cannot have multiple periods in a row, and must be no longer than 30 characters",
        ),
    password: z
        .string()
        .regex(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
            "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number. Special characters are allowed",
        ),
    //
}).omit({
    id: true,
});

export const usersSelectSchema = createSelectSchema(usersTable).omit({
    password: true,
});

export const usersParamsSchema = createSelectSchema(usersTable, {
    id: z.coerce.number(),
}).omit({
    password: true,
});

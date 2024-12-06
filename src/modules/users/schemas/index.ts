import { z } from "@hono/zod-openapi";
import { type InferSelectModel, sql } from "drizzle-orm";
import { check, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const usersTable = sqliteTable(
    "users",
    {
        id: int().primaryKey({ autoIncrement: true }),
        email: text().unique(),
        phone: text().unique(),
        password: text().notNull(),
        firstName: text().notNull(),
        lastName: text().notNull(),
        role: text().$type<"user" | "admin">().default("user").notNull(),
        avatar: text(),
        verified: int({ mode: "boolean" }).default(false),
        kycCardFront: text(),
        kycCardBack: text(),
        kycSelfie: text(),
        balance: int().notNull().default(0),
        globalId: text().unique(),
    },
    (table) => ({
        checkConstraint: check(
            "one_of_email_or_phone_not_null",
            sql`${table.email} IS NOT NULL OR ${table.phone} IS NOT NULL`,
        ),
    }),
);

export type User = Pick<
    InferSelectModel<typeof usersTable>,
    "id" | "email" | "phone" | "firstName" | "lastName" | "role" | "verified" | "avatar" | "globalId"
>;

export const usersInsertSchemaCommon = createInsertSchema(usersTable, {
    password: z
        .string()
        .regex(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
            "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number. Special characters are allowed",
        ),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
}).omit({
    id: true,
    globalId: true,
    email: true,
    phone: true,
    role: true,
    verified: true,
    kycCardFront: true,
    kycCardBack: true,
    kycSelfie: true,
    balance: true,
    avatar: true,
});

export const usersInsertSchema = z
    .discriminatedUnion("loginWith", [
        z.object({
            loginWith: z.literal("email"),
            email: z.string().email(),
        }),
        z.object({
            loginWith: z.literal("phone"),
            phone: z.string(),
        }),
    ])
    .and(usersInsertSchemaCommon);

export const usersLoginSchema = z
    .discriminatedUnion("loginWith", [
        z.object({
            loginWith: z.literal("email"),
            email: z.string().email(),
        }),
        z.object({
            loginWith: z.literal("phone"),
            phone: z.string(),
        }),
    ])
    .and(
        z.object({
            password: z.string(),
        }),
    );

export const usersUpdateSchema = z
    .object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
    })
    .and(usersInsertSchemaCommon.partial());

export const profileUpdateSchema = createInsertSchema(usersTable).pick({
    firstName: true,
    lastName: true,
});

export const usersSelectSchema = createSelectSchema(usersTable, {}).omit({
    password: true,
    kycCardFront: true,
    kycCardBack: true,
    kycSelfie: true,
    balance: true,
});

export const usersParamsSchema = createSelectSchema(usersTable, {
    id: z.coerce.number(),
}).omit({
    password: true,
});

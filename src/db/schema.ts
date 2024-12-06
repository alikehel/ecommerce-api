import { sql } from "drizzle-orm";
import { check, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { timestamps } from "./lib/timestamps";

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
        avatar: text().notNull().default(""),
        verified: int({ mode: "boolean" }).default(false).notNull(),
        kycCardFront: text().notNull().default(""),
        kycCardBack: text().notNull().default(""),
        kycSelfie: text().notNull().default(""),
        balance: int().notNull().default(0),
        globalId: text().unique(),
        ...timestamps,
    },
    (table) => ({
        checkConstraint: check(
            "one_of_email_or_phone_not_null",
            sql`${table.email} IS NOT NULL OR ${table.phone} IS NOT NULL`,
        ),
    }),
);

export const sessionsTable = sqliteTable("sessions", {
    id: text().primaryKey(),
    userId: int()
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    expiresAt: int({
        mode: "timestamp",
    }).notNull(),
    ...timestamps,
});

export const productsTable = sqliteTable("products", {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().unique().notNull(),
    description: text().notNull(),
    price: int().notNull(), // Store in cents to avoid floating point errors
    stock: int().default(0).notNull(), // Track available stock
    categoryId: int()
        .references(() => categoriesTable.id, { onDelete: "set null" })
        .notNull(),
    mainImage: text().notNull().default(""),
    images: text({ mode: "json" }).$type<string[]>().default([]).notNull(),
    active: int({ mode: "boolean" }).default(true).notNull(),
    ...timestamps,
});

export const servicesTable = sqliteTable("services", {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().unique().notNull(),
    description: text().notNull(),
    price: int().notNull(), // Store in cents to avoid floating point errors
    categoryId: int()
        .references(() => categoriesTable.id, { onDelete: "set null" })
        .notNull(),
    mainImage: text().notNull().default(""),
    images: text({ mode: "json" }).$type<string[]>().default([]).notNull(),
    active: int({ mode: "boolean" }).default(true).notNull(),
    ...timestamps,
});

export const categoriesTable = sqliteTable("categories", {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().unique().notNull(),
    description: text().notNull(),
    type: text().$type<"product" | "service" | "general">().default("general").notNull(),
    ...timestamps,
});

export const schema = {
    sessionsTable,
    usersTable,
    productsTable,
    categoriesTable,
    servicesTable,
};

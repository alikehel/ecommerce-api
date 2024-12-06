import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { sessionsTable } from "@/modules/auth/schemas";
import { usersTable } from "@/modules/users/schemas";

import { timestamps } from "./lib/timestamps";

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

export { usersTable, sessionsTable };

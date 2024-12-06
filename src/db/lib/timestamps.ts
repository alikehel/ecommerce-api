import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/sqlite-core";

export const timestamps = {
    createdAt: text()
        .notNull()
        .default(sql`(current_timestamp)`),
    updatedAt: text()
        .notNull()
        .default(sql`(current_timestamp)`),
    deletedAt: text(),
};

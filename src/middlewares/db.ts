import { drizzle } from "drizzle-orm/d1";

import { schema } from "@/db/schema";
import type { MiddlewareHandler } from "@/types/app-type";

export const db = (): MiddlewareHandler => {
    return async (c, next) => {
        const db = drizzle(c.env.DB, {
            schema: schema,
            logger: true,
            casing: "snake_case",
        });
        c.set("db", db);
        return next();
    };
};

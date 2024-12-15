import { AnyColumn, sql } from "drizzle-orm";

export const increment = (column: AnyColumn, value: number) => {
    return sql`${column} + ${value}`;
};

export const decrement = (column: AnyColumn, value: number) => {
    return sql`${column} - ${value}`;
};

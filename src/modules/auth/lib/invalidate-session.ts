import type { schema } from "@/db/schema";
import type { Bindings, Variables } from "@/types/app-bindings";
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Context } from "hono";
import { sessionsTable } from "../schemas";
import { deleteSessionTokenCookie } from "./delete-session-token-cookie";

export async function invalidateSession(
    c: Context<{
        Bindings: Bindings;
        Variables: Variables;
    }>,
    db: DrizzleD1Database<typeof schema>,
    sessionId: string,
): Promise<void> {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
    deleteSessionTokenCookie(c);
}

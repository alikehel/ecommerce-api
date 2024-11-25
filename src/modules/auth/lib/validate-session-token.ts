import type { schema } from "@/db/schema";
import { usersTable } from "@/modules/users/schemas";
import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { type SessionValidationResult, sessionsTable } from "../schemas";
import { encodeHexLowerCase } from "./encode-hex-lower-case";
import { sha256 } from "./sha256";

export async function validateSessionToken(
    db: DrizzleD1Database<typeof schema>,
    token: string,
): Promise<SessionValidationResult> {
    const sessionId = encodeHexLowerCase(
        await sha256(new TextEncoder().encode(token)),
    );
    const result = await db
        .select({ user: usersTable, session: sessionsTable })
        .from(sessionsTable)
        .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
        .where(eq(sessionsTable.id, sessionId));
    if (result.length < 1) {
        return { session: null, user: null };
    }
    const { user, session } = result[0];
    if (Date.now() >= session.expiresAt.getTime()) {
        await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id));
        return { session: null, user: null };
    }
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await db
            .update(sessionsTable)
            .set({
                expiresAt: session.expiresAt,
            })
            .where(eq(sessionsTable.id, session.id));
    }
    return { session, user };
}

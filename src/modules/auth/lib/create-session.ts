import type { schema } from "@/db/schema";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { type Session, sessionsTable } from "../schemas";
import { encodeHexLowerCase } from "./encode-hex-lower-case";
import { sha256 } from "./sha256";

export async function createSession(
    db: DrizzleD1Database<typeof schema>,
    token: string,
    userId: number,
): Promise<{ id: string; userId: number; expiresAt: Date }> {
    const sessionId = encodeHexLowerCase(
        await sha256(new TextEncoder().encode(token)),
    );
    const session: Session = {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    await db.insert(sessionsTable).values(session);
    return session;
}

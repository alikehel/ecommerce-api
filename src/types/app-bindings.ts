import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { PinoLogger } from "hono-pino";

import type { Environment } from "@/config";
import type { schema } from "@/db/schema";
import type { User } from "@/modules/users/schemas";

export type Bindings = Environment & {
    DB: D1Database;
    BUCKET: R2Bucket;
};

export type Variables = {
    logger: PinoLogger;
    db: DrizzleD1Database<typeof schema> & {
        $client: D1Database;
    };
    user: User;
};

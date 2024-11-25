import type { MiddlewareHandler } from "@/types/app-type";
import type { Context } from "hono";

import type { Env } from "hono-pino";
import { logger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";

import type {} from "../types/app-bindings";

export function pinoLogger() {
    return ((c, next) =>
        logger({
            pino: pino(
                {
                    level: c.env.LOG_LEVEL || "info",
                },
                c.env.ENV === "prod" ? undefined : pretty(),
            ),
            http: {
                reqId: () => crypto.randomUUID(),
            },
        })(c as unknown as Context<Env>, next)) satisfies MiddlewareHandler;
}

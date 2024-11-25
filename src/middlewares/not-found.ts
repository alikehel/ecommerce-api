import { NOT_FOUND } from "@/lib/http-status-codes";
import type { errorResponseType } from "@/lib/response-schemas";
import type { Bindings, Variables } from "@/types/app-bindings";
import type { NotFoundHandler } from "hono";

export const notFound: NotFoundHandler<{
    Bindings: Bindings;
    Variables: Variables;
}> = (c) => {
    c.var.logger.error(`Route not found: ${c.req.path}`);
    return c.json(
        {
            success: false,
            error: {
                message: `Route not found: ${c.req.path}`,
            },
        } satisfies errorResponseType,
        NOT_FOUND,
    );
};

import { INTERNAL_SERVER_ERROR, OK } from "@/lib/http-status-codes";
import type { errorResponseType } from "@/lib/response-schemas";
import type { Bindings, Variables } from "@/types/app-bindings";
import type { ErrorHandler } from "hono";
import type { StatusCode } from "hono/utils/http-status";

export const onError: ErrorHandler<{
    Bindings: Bindings;
    Variables: Variables;
}> = (err, c) => {
    const currentStatus =
        "status" in err ? err.status : c.newResponse(null).status;
    const statusCode =
        currentStatus !== OK
            ? (currentStatus as StatusCode)
            : INTERNAL_SERVER_ERROR;
    // const env = c.env?.ENV || c.env?.ENV;
    c.var.logger.error({
        error: {
            message: err.message,
            stack: err.stack,
        },
    });
    return c.json(
        {
            success: false,
            error: {
                message: err.message,
            },
            // stack: env === "prod" ? undefined : err.stack,
        } satisfies errorResponseType,
        statusCode,
    );
};

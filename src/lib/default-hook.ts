import { UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import type { Hook } from "@hono/zod-openapi";
import { fromError } from "zod-validation-error";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const defaultHook: Hook<any, any, any, any> = (result, c) => {
    if (!result.success) {
        return c.json(
            {
                success: result.success,
                error: {
                    message: fromError(result.error).toString(),
                },
            },
            UNPROCESSABLE_ENTITY,
        );
    }
};

export default defaultHook;

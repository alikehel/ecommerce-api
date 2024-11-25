import type { Hook } from "@hono/zod-openapi";
import { fromError } from "zod-validation-error";

import { UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

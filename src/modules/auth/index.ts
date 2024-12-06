import { createRouter } from "@/lib/create-app";

import { forgetPasswordHandler, forgetPasswordRoute } from "./routes/forget-password";
import { loginHandler, loginRoute } from "./routes/login";
import { logoutHandler, logoutRoute } from "./routes/logout";
import { registerHandler, registerRoute } from "./routes/register";
import { resetPasswordHandler, resetPasswordRoute } from "./routes/reset-password";

export const authRouter = createRouter()
    .openapi(registerRoute, registerHandler)
    .openapi(loginRoute, loginHandler)
    .openapi(logoutRoute, logoutHandler)
    .openapi(forgetPasswordRoute, forgetPasswordHandler)
    .openapi(resetPasswordRoute, resetPasswordHandler);

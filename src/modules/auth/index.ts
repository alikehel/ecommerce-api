import { createRouter } from "@/lib/create-app";
import { loginHandler, loginRoute } from "./routes/login";
import { logoutHandler, logoutRoute } from "./routes/logout";
import { registerHandler, registerRoute } from "./routes/register";

export const authRouter = createRouter()
    .openapi(registerRoute, registerHandler)
    .openapi(loginRoute, loginHandler)
    .openapi(logoutRoute, logoutHandler);

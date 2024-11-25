import { configureOpenAPI } from "./lib/configure-openapi";
import { configureAuthRouter, configureRouters } from "./lib/configure-routers";
import { createApp } from "./lib/create-app";
import { authRouter } from "./modules/auth";
import { usersRouter } from "./modules/users";

// Create App

const app = createApp();

// Configure OpenAPI

configureOpenAPI(app);

// Configure Routes

configureAuthRouter(app, authRouter);

configureRouters(app, [usersRouter]);

// Export App

export default app;

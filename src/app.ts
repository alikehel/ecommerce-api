import { configureOpenAPI } from "./lib/configure-openapi";
import { configureAuthRouter, configureRouters } from "./lib/configure-routers";
import { createApp } from "./lib/create-app";
import { authRouter } from "./modules/auth";
import { categoriesRouter } from "./modules/categories";
import { kycRouter } from "./modules/kyc";
import { productsRouter } from "./modules/products";
import { servicesRouter } from "./modules/services";
import { usersRouter } from "./modules/users";

// Create App

const app = createApp();

// Configure OpenAPI

configureOpenAPI(app);

// Configure Routes

configureAuthRouter(app, authRouter);

configureRouters(app, [usersRouter, kycRouter, servicesRouter, productsRouter, categoriesRouter]);

// Export App

export default app;

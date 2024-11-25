import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { MiddlewareHandler as HonoMiddlewareHandler } from "hono";
import type { Bindings, Variables } from "./app-bindings";

export type AppType = OpenAPIHono<{
    Bindings: Bindings;
    Variables: Variables;
}>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
    R,
    { Bindings: Bindings; Variables: Variables }
>;

export type MiddlewareHandler = HonoMiddlewareHandler<{
    Bindings: Bindings;
    Variables: Variables;
}>;

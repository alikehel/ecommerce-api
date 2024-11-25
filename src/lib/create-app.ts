import { cors } from "@/middlewares/cors";
import { db } from "@/middlewares/db";
import { env } from "@/middlewares/env";
import { git } from "@/middlewares/git";
import { notFound } from "@/middlewares/not-found";
import { onError } from "@/middlewares/on-error";
import { pinoLogger } from "@/middlewares/pino-logger";
import { serveEmojiFavicon } from "@/middlewares/serve-emoji-favicon";
import type { Bindings, Variables } from "@/types/app-bindings";
import { OpenAPIHono } from "@hono/zod-openapi";
import { prettyJSON } from "hono/pretty-json";
import defaultHook from "./default-hook";

export const createRouter = () => {
    return new OpenAPIHono<{
        Bindings: Bindings;
        Variables: Variables;
    }>({ defaultHook: defaultHook });
};

// export const createRoute = <T extends RouteConfig>(data: {
//     route: T;
//     middlewares?: MiddlewareHandler[];
//     handler: AppRouteHandler<T>;
// }) => {
//     return createRouter().openapi(
//         createHonoRoute({ ...data.route, middleware: data.middlewares }),
//         data.handler as unknown as AppRouteHandler<
//             ReturnType<typeof createHonoRoute>
//         >,
//     );
// };

export const createApp = () => {
    const app = createRouter();

    app.notFound(notFound);

    app.use(pinoLogger());

    app.on("GET", ["/env"], env(), (c) => c.text("No ENV Variables Missing"));

    app.use(git());

    app.use("*", cors());

    app.use(serveEmojiFavicon("🚀"));

    app.use(prettyJSON());

    app.onError(onError);

    app.use(db());

    return app;
};

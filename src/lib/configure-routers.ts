import { isLoggedIn } from "@/middlewares/is-logged-in";
import type { AppType } from "@/types/app-type";

export function configureRouters(app: AppType, routers: Array<AppType>) {
    for (const router of routers) {
        app.route("/", router);
    }
}

export function configureAuthRouter(app: AppType, router: AppType) {
    app.route("/", router);
    app.use(isLoggedIn());
}

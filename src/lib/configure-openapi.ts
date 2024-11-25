import type { AppType } from "@/types/app-type";
import { swaggerUI } from "@hono/swagger-ui";
import { apiReference } from "@scalar/hono-api-reference";

export function configureOpenAPI(app: AppType) {
    app.get("/", async (c) => {
        return c.html(
            `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>API Welcome Page</title>
                    <style>
                        body {
                            margin: 0;
                            height: 100vh;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            background-color: black;
                            color: white;
                            font-family: Arial, sans-serif;
                        }
                        .container {
                            text-align: center;
                        }
                        a {
                            color: #FF0000;
                            text-decoration: none;
                            font-size: 2rem;
                        }
                        a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <p><a href="/api">API Spec</a></p>
                        <p><a href="/api/swagger">Swagger UI</a></p>
                        <p><a href="/api/scalar">Scalar UI</a></p>
                    </div>
                </body>
                </html>
            `,
        );
    });

    app.openAPIRegistry.registerComponent("securitySchemes", "cookieAuth", {
        type: "apiKey",
        name: "session",
        in: "cookie",
    });

    app.doc("/api", {
        openapi: "3.0.0",
        info: {
            version: "0.0.0",
            title: "API",
        },
    });

    app.get("/api/swagger", swaggerUI({ url: "/api" }));

    app.get(
        "/api/scalar",
        apiReference({
            theme: "deepSpace",
            layout: "modern",
            defaultHttpClient: {
                targetKey: "javascript",
                clientKey: "fetch",
            },
            defaultOpenAllTags: true,
            spec: {
                url: "/api",
            },
        }),
    );
}

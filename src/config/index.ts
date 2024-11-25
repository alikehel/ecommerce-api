// import path from "node:path";
// import { config } from "dotenv";
// import { expand } from "dotenv-expand";
import type { Bindings } from "@/types/app-bindings";
import { z } from "zod";

// expand(
//     config({
//         path: path.resolve(
//             process.cwd(),
//             process.env.ENV === "test" ? ".env.test" : ".env",
//         ),
//     }),
// );

const EnvSchema = z
    .object({
        // DB: z.instanceof(D1Database),
        ENV: z.enum(["dev", "test", "prod", "stage"]).optional().default("dev"),
        LOG_LEVEL: z
            .enum([
                "fatal",
                "error",
                "warn",
                "info",
                "debug",
                "trace",
                "silent",
            ])
            .optional()
            .default("debug"),
        CLOUDFLARE_ACCOUNT_ID: z.string(),
        CLOUDFLARE_DATABASE_ID: z.string().optional(),
        CLOUDFLARE_D1_TOKEN: z.string().optional(),
        ALLOWED_HOST: z.string(),
        GITHUB_REF_NAME: z.string().optional(),
        GITHUB_SHA: z.string().optional(),
    })
    .passthrough()
    .superRefine((input, ctx) => {
        if (input.ENV === "prod" && !input.CLOUDFLARE_DATABASE_ID) {
            ctx.addIssue({
                code: z.ZodIssueCode.invalid_type,
                expected: "string",
                received: "undefined",
                path: ["CLOUDFLARE_DATABASE_ID"],
                message: "Must be set when ENV is 'prod'",
            });
        }
        if (input.ENV === "prod" && !input.CLOUDFLARE_D1_TOKEN) {
            ctx.addIssue({
                code: z.ZodIssueCode.invalid_type,
                expected: "string",
                received: "undefined",
                path: ["CLOUDFLARE_D1_TOKEN"],
                message: "Must be set when ENV is 'prod'",
            });
        }
    });

export type Environment = z.infer<typeof EnvSchema>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function parseEnv(data: any): Bindings {
    const { data: env, error } = EnvSchema.safeParse(data);

    if (error) {
        const errorMessage = `Invalid ENV - ${Object.entries(
            error.flatten().fieldErrors,
        )
            .map(([key, errors]) => `${key}: ${errors?.join(",")}`)
            .join(" | ")}`;
        throw new Error(errorMessage);
    }

    return env as Bindings;
}

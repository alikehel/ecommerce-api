import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { CREATED, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { usersSelectSchema, usersTable } from "@/modules/users/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const uploadKYCDocumentsRoute = createRoute({
    tags: ["KYC"],
    method: "post",
    path: "/api/v1/kyc/upload",
    summary: "Upload KYC Documents",
    description: "Upload KYC Documents",
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: z.object({
                        cardFront: z
                            .custom<File>((v) => v instanceof File)
                            .openapi({
                                type: "string",
                                format: "binary",
                            }),
                        cardBack: z
                            .custom<File>((v) => v instanceof File)
                            .openapi({
                                type: "string",
                                format: "binary",
                            }),
                        selfie: z
                            .custom<File>((v) => v instanceof File)
                            .openapi({
                                type: "string",
                                format: "binary",
                            }),
                    }),
                },
            },
            description: "Upload KYC Documents",
        },
    },
    responses: {
        [CREATED]: jsonContent(
            successResponseSchema(
                z.object({
                    user: usersSelectSchema,
                }),
            ),
            "Uploaded KYC Documents Successfully",
        ),
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
    },
});

export const uploadKYCDocumentsHandler: AppRouteHandler<typeof uploadKYCDocumentsRoute> = async (c) => {
    const data = c.req.valid("form");
    const db = c.var.db;

    // Only allow picture files
    const cardFrontExtension = data.cardFront.name.split(".").pop();
    const cardBackExtension = data.cardBack.name.split(".").pop();
    const selfieExtension = data.selfie.name.split(".").pop();
    if (!cardFrontExtension || !["jpg", "jpeg", "png"].includes(cardFrontExtension)) {
        return c.json(
            {
                success: false,
                error: {
                    message: "Invalid file type for card front",
                },
            },
            UNPROCESSABLE_ENTITY,
        );
    }
    if (!cardBackExtension || !["jpg", "jpeg", "png"].includes(cardBackExtension)) {
        return c.json(
            {
                success: false,
                error: {
                    message: "Invalid file type for card back",
                },
            },
            UNPROCESSABLE_ENTITY,
        );
    }
    if (!selfieExtension || !["jpg", "jpeg", "png"].includes(selfieExtension)) {
        return c.json(
            {
                success: false,
                error: {
                    message: "Invalid file type for selfie",
                },
            },
            UNPROCESSABLE_ENTITY,
        );
    }

    const cardFrontKey = `kyc/${c.var.user.id}/card-front.${data.cardFront.name.split(".").pop()}`;
    const cardBackKey = `kyc/${c.var.user.id}/card-back.${data.cardBack.name.split(".").pop()}`;
    const selfieKey = `kyc/${c.var.user.id}/selfie.${data.selfie.name.split(".").pop()}`;

    await Promise.all([
        c.env.BUCKET.put(cardFrontKey, data.cardFront),
        c.env.BUCKET.put(cardBackKey, data.cardBack),
        c.env.BUCKET.put(selfieKey, data.selfie),
    ]);

    const [user] = await db
        .update(usersTable)
        .set({
            kycCardFront: cardFrontKey,
            kycCardBack: cardBackKey,
            kycSelfie: selfieKey,
        })
        .where(eq(usersTable.id, c.var.user.id))
        .returning({
            id: usersTable.id,
            email: usersTable.email,
            phone: usersTable.phone,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
            role: usersTable.role,
            verified: usersTable.verified,
            kycCardFront: usersTable.kycCardFront,
            kycCardBack: usersTable.kycCardBack,
            kycSelfie: usersTable.kycSelfie,
        });

    return c.json(
        {
            success: true,
            data: {
                user: user,
            },
        },
        CREATED,
    );
};

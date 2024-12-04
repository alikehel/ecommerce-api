import { createRoute, z } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";

import { NOT_FOUND, OK, UNPROCESSABLE_ENTITY } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { errorResponseSchema, successResponseSchema } from "@/lib/response-schemas";
import { usersSelectSchema, usersTable } from "@/modules/users/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const updateProfileAvatarRoute = createRoute({
    tags: ["Users' Profile"],
    method: "patch",
    path: "/api/v1/users/me/avatar",
    summary: "Update Profile Avatar",
    description: "Update Profile Avatar",
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: z.object({
                        avatar: z
                            .custom<File>((v) => v instanceof File)
                            .openapi({
                                type: "string",
                                format: "binary",
                            }),
                    }),
                },
            },
            description: "User Profile Avatar",
        },
    },
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    user: usersSelectSchema,
                }),
            ),
            "User Profile Avatar Updated Successfully",
        ),
        [UNPROCESSABLE_ENTITY]: jsonContent(errorResponseSchema, "Validation error"),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "User not found"),
    },
});

export const updateProfileAvatarHandler: AppRouteHandler<typeof updateProfileAvatarRoute> = async (c) => {
    const data = c.req.valid("form");
    const bucketUrl = c.env.BUCKET_URL;

    // Only allow picture files
    const avatarExtension = data.avatar.name.split(".").pop();
    if (!avatarExtension || !["jpg", "jpeg", "png"].includes(avatarExtension)) {
        return c.json(
            {
                success: false,
                error: {
                    message: "Invalid file type",
                },
            },
            UNPROCESSABLE_ENTITY,
        );
    }

    const avatarKey = `avatars/${c.var.user.id}/avatar.${data.avatar.name.split(".").pop()}`;
    await c.env.BUCKET.put(avatarKey, data.avatar);

    const [user] = await c.var.db
        .update(usersTable)
        .set({
            avatar: `${bucketUrl}/${avatarKey}`,
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
            avatar: usersTable.avatar,
        });

    if (!user) {
        return c.json(
            {
                success: false,
                error: {
                    message: "User not found",
                },
            },
            NOT_FOUND,
        );
    }

    return c.json({ success: true, data: { user: user } }, OK);
};

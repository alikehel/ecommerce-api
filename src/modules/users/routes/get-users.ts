import { createRoute, z } from "@hono/zod-openapi";
import { type AnyColumn, and, asc, desc, eq } from "drizzle-orm";

import { usersTable } from "@/db/schema";
import { NOT_FOUND, OK } from "@/lib/http-status-codes";
import { jsonContent } from "@/lib/openapi-helpers";
import { calculateOffset, calculatePagesCount } from "@/lib/pagination";
import { requestParamsWithPaginationSchema } from "@/lib/request-schemas";
import {
    errorResponseSchema,
    paginationResponseSchema,
    type paginationResponseType,
    successResponseSchema,
} from "@/lib/response-schemas";
import { usersParamsSchema, usersSelectSchema } from "@/modules/users/schemas";
import type { AppRouteHandler } from "@/types/app-type";

export const getUsersRoute = createRoute({
    tags: ["Users"],
    method: "get",
    path: "/api/v1/users",
    summary: "Get All Users",
    description: "Get all users",
    request: {
        query: requestParamsWithPaginationSchema(
            z.object({
                user_id: usersParamsSchema.shape.id.optional(),
                first_name: usersParamsSchema.shape.firstName.optional(),
                last_name: usersParamsSchema.shape.lastName.optional(),
            }),
            Object.keys({
                ...usersParamsSchema.shape,
            }),
        ),
    },
    responses: {
        [OK]: jsonContent(
            successResponseSchema(
                z.object({
                    users: z.array(usersSelectSchema.and(z.object({ balance: z.number() }))),
                    pagination: paginationResponseSchema,
                }),
            ),
            "Get all users",
        ),
        [NOT_FOUND]: jsonContent(errorResponseSchema, "No users found"),
    },
});

export const getUsersHandler: AppRouteHandler<typeof getUsersRoute> = async (c) => {
    const queryParams = c.req.valid("query");

    const where = and(
        queryParams.userId ? eq(usersTable.id, queryParams.userId) : undefined,
        queryParams.firstName ? eq(usersTable.firstName, queryParams.firstName) : undefined,
    );

    const totalItemsCount = await c.var.db.$count(usersTable, where);

    const totalPagesCount = calculatePagesCount(totalItemsCount, queryParams.pageSize);

    if (queryParams.page > totalPagesCount) {
        queryParams.page = totalPagesCount;
    }

    const users = await c.var.db
        .select({
            id: usersTable.id,
            email: usersTable.email,
            phone: usersTable.phone,
            firstName: usersTable.firstName,
            lastName: usersTable.lastName,
            role: usersTable.role,
            verified: usersTable.verified,
            balance: usersTable.balance,
            avatar: usersTable.avatar,
            globalId: usersTable.globalId,
            createdAt: usersTable.createdAt,
            updatedAt: usersTable.updatedAt,
            deletedAt: usersTable.deletedAt,
        })
        .from(usersTable)
        .where(where)
        .orderBy(
            queryParams.sortingOrder === "asc"
                ? asc(usersTable[queryParams.sortingField as keyof typeof usersTable] as AnyColumn)
                : desc(usersTable.id),
        )
        .limit(queryParams.pageSize)
        .offset(calculateOffset(queryParams.page, queryParams.pageSize));

    const pagination = {
        currentPage: queryParams.page,
        totalPagesCount: totalPagesCount,
        itemsPerPage: queryParams.pageSize < totalItemsCount ? queryParams.pageSize : totalItemsCount,
        totalItemsCount: totalItemsCount,
    } satisfies paginationResponseType;

    return c.json(
        {
            success: true,
            data: {
                users: users,
                pagination: pagination,
            },
        },
        OK,
    );
};

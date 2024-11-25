import { type ObjectToCamel, objectToCamel } from "ts-case-convert";
import { z } from "zod";

export function requestParamsSchema<T extends z.ZodTypeAny>(
    schema: T,
): z.ZodEffects<T, ObjectToCamel<z.infer<T>>> {
    return schema.transform(
        (data) => objectToCamel(data) as ObjectToCamel<z.infer<T>>,
    );
}

const paramsPaginationSchema = (sortingFields: string[]) =>
    z.object({
        page: z.coerce.number().min(1).default(1),
        page_size: z.coerce.number().min(1).max(100).default(10),
        sorting_order: z.enum(["asc", "desc"]).default("asc"),
        sorting_field: z
            .enum(sortingFields as [string, ...string[]])
            .default("id"),
    });

export function requestParamsWithPaginationSchema<T extends z.AnyZodObject>(
    schema: T,
    sortingFields: string[],
): z.ZodEffects<
    T & ReturnType<typeof paramsPaginationSchema>,
    ObjectToCamel<z.infer<T & ReturnType<typeof paramsPaginationSchema>>>
> {
    // @ts-expect-error todo
    return schema
        .merge(paramsPaginationSchema(sortingFields))
        .transform(
            (data) =>
                objectToCamel(data) as ObjectToCamel<
                    z.infer<T & ReturnType<typeof paramsPaginationSchema>>
                >,
        );
}

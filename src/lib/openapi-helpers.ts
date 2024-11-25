import type { ZodSchema } from "@/types/zod-schema";
import {
    OpenAPIRegistry,
    OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

export const jsonContent = <T extends ZodSchema>(
    schema: T,
    description: string,
) => {
    return {
        content: {
            "application/json": {
                schema,
            },
        },
        description,
    };
};

export const jsonContentRequired = <T extends ZodSchema>(
    schema: T,
    description: string,
) => {
    return {
        ...jsonContent(schema, description),
        required: true,
    };
};

export const jsonContentOneOf = <T extends ZodSchema>(
    schemas: T[],
    description: string,
) => {
    return {
        content: {
            "application/json": {
                schema: {
                    oneOf: oneOf(schemas),
                },
            },
        },
        description,
    };
};

const oneOf = <T extends ZodSchema>(schemas: T[]) => {
    const registry = new OpenAPIRegistry();

    schemas.forEach((schema, index) => {
        registry.register(index.toString(), schema);
    });

    const generator = new OpenApiGeneratorV3(registry.definitions);
    const components = generator.generateComponents();

    return components.components?.schemas
        ? // biome-ignore lint/style/noNonNullAssertion: <explanation>
          Object.values(components.components!.schemas!)
        : [];
};

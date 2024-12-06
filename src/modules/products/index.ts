import { createRouter } from "@/lib/create-app";

import { createProductHandler, createProductRoute } from "./routes/create-product";
import { deleteProductHandler, deleteProductRoute } from "./routes/delete-product";
import { getProductHandler, getProductRoute } from "./routes/get-product";
import { getProductsHandler, getProductsRoute } from "./routes/get-products";
import { updateProductHandler, updateProductRoute } from "./routes/update-product";

export const productsRouter = createRouter()
    .openapi(createProductRoute, createProductHandler)
    .openapi(getProductsRoute, getProductsHandler)
    .openapi(getProductRoute, getProductHandler)
    .openapi(updateProductRoute, updateProductHandler)
    .openapi(deleteProductRoute, deleteProductHandler);

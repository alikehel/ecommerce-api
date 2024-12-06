import { createRouter } from "@/lib/create-app";

import { createCategoryHandler, createCategoryRoute } from "./routes/create-category";
import { deleteCategoryHandler, deleteCategoryRoute } from "./routes/delete-category";
import { getCategoriesHandler, getCategoriesRoute } from "./routes/get-categories";
import { getCategoryHandler, getCategoryRoute } from "./routes/get-category";
import { updateCategoryHandler, updateCategoryRoute } from "./routes/update-category";

export const categoriesRouter = createRouter()
    .openapi(createCategoryRoute, createCategoryHandler)
    .openapi(getCategoriesRoute, getCategoriesHandler)
    .openapi(getCategoryRoute, getCategoryHandler)
    .openapi(updateCategoryRoute, updateCategoryHandler)
    .openapi(deleteCategoryRoute, deleteCategoryHandler);

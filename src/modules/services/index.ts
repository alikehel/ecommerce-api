import { createRouter } from "@/lib/create-app";

import { createServiceHandler, createServiceRoute } from "./routes/create-service";
import { deleteServiceHandler, deleteServiceRoute } from "./routes/delete-service";
import { getServiceHandler, getServiceRoute } from "./routes/get-service";
import { getServicesHandler, getServicesRoute } from "./routes/get-services";
import { updateServiceHandler, updateServiceRoute } from "./routes/update-service";

export const servicesRouter = createRouter()
    .openapi(createServiceRoute, createServiceHandler)
    .openapi(getServicesRoute, getServicesHandler)
    .openapi(getServiceRoute, getServiceHandler)
    .openapi(updateServiceRoute, updateServiceHandler)
    .openapi(deleteServiceRoute, deleteServiceHandler);

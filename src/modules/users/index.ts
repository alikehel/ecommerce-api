import { createRouter } from "@/lib/create-app";

import { createUserHandler, createUserRoute } from "./routes/create-user";
import { deleteUserHandler, deleteUserRoute } from "./routes/delete-user";
import { getProfileHandler, getProfileRoute } from "./routes/get-profile";
import { getUserHandler, getUserRoute } from "./routes/get-user";
import { getUsersHandler, getUsersRoute } from "./routes/get-users";
import { updateProfileHandler, updateProfileRoute } from "./routes/update-profile";
import { updateUserHandler, updateUserRoute } from "./routes/update-user";

export const usersRouter = createRouter()
    .openapi(getProfileRoute, getProfileHandler)
    .openapi(createUserRoute, createUserHandler)
    .openapi(deleteUserRoute, deleteUserHandler)
    .openapi(getUserRoute, getUserHandler)
    .openapi(getUsersRoute, getUsersHandler)
    .openapi(updateProfileRoute, updateProfileHandler)
    .openapi(updateUserRoute, updateUserHandler);

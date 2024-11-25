import { createRouter } from "@/lib/create-app";
import { createUserHandler, createUserRoute } from "./routes/create-user";
import { deleteUserHandler, deleteUserRoute } from "./routes/delete-user";
import { getUserHandler, getUserRoute } from "./routes/get-user";
import { getUsersHandler, getUsersRoute } from "./routes/get-users";
import { meHandler, meRoute } from "./routes/me";
import { updateUserHandler, updateUserRoute } from "./routes/update-user";

export const usersRouter = createRouter()
    .openapi(meRoute, meHandler)
    .openapi(createUserRoute, createUserHandler)
    .openapi(deleteUserRoute, deleteUserHandler)
    .openapi(getUserRoute, getUserHandler)
    .openapi(getUsersRoute, getUsersHandler)
    .openapi(updateUserRoute, updateUserHandler);

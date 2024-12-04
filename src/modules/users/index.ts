import { createRouter } from "@/lib/create-app";

import { changePasswordHandler, changePasswordRoute } from "./routes/change-password";
import { createUserHandler, createUserRoute } from "./routes/create-user";
import { deleteUserHandler, deleteUserRoute } from "./routes/delete-user";
import { getProfileHandler, getProfileRoute } from "./routes/get-profile";
import { getUserHandler, getUserRoute } from "./routes/get-user";
import { getUsersHandler, getUsersRoute } from "./routes/get-users";
import { updateProfileHandler, updateProfileRoute } from "./routes/update-profile";
import { updateProfileAvatarHandler, updateProfileAvatarRoute } from "./routes/update-profile-avatar";
import { updateUserHandler, updateUserRoute } from "./routes/update-user";

export const usersRouter = createRouter()
    .openapi(getProfileRoute, getProfileHandler)
    .openapi(updateProfileRoute, updateProfileHandler)
    .openapi(changePasswordRoute, changePasswordHandler)
    .openapi(updateProfileAvatarRoute, updateProfileAvatarHandler)
    .openapi(createUserRoute, createUserHandler)
    .openapi(getUsersRoute, getUsersHandler)
    .openapi(getUserRoute, getUserHandler)
    .openapi(updateUserRoute, updateUserHandler)
    .openapi(deleteUserRoute, deleteUserHandler);

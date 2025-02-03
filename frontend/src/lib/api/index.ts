import * as auth from "./auth"
import type { LoginForm, AuthorizeForm, AccessTokenResponse, TokenResponse, JsonWebTokenPayload } from "./auth"
import * as user from "./user"
import type { User, UserPasswordUpdateForm, UserPartialUpdateForm } from "./user"
import * as app from "./app"
import type { App, MyApp, MyAppDetail, UserAppPermission, UserAppRelation } from "./app"
import * as adminUser from "./admin-user"
import type { AdminUserPasswordUpdateForm, AdminUserPartialUpdateForm } from "./admin-user"

export { preloadAuthorization } from "./fetch"

export {auth, user, app}

export const admin = {
    user: adminUser
}

export type {
    LoginForm, AuthorizeForm, AccessTokenResponse, TokenResponse, JsonWebTokenPayload,
    User, UserPartialUpdateForm, UserPasswordUpdateForm,
    App, MyApp, MyAppDetail, UserAppPermission, UserAppRelation,
    AdminUserPartialUpdateForm, AdminUserPasswordUpdateForm
}
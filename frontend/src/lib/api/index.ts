import { login, logout, authorize, register } from "./auth"
import type { LoginForm, AuthorizeForm, AccessTokenResponse, TokenResponse, JsonWebTokenPayload } from "./auth"
import { getUserInfo, patchUserInfo, patchUserPassword } from "./user"
import type { User, UserPasswordUpdateForm, UserPartialUpdateForm } from "./user"
import { listApps, getApp } from "./app"
import type { App, MyApp, MyAppDetail, UserAppPermission, UserAppRelation } from "./app"

export { preloadAuthorization } from "./fetch"

export const auth = {login, register, authorize, logout}

export const user = {getUserInfo, patchUserInfo, patchUserPassword}

export const app = {listApps, getApp}

export type {
    LoginForm, AuthorizeForm, AccessTokenResponse, TokenResponse, JsonWebTokenPayload,
    User, UserPartialUpdateForm, UserPasswordUpdateForm,
    App, MyApp, MyAppDetail, UserAppPermission, UserAppRelation,
}
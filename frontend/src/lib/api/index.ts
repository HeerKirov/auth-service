import { login, logout, authorize, register } from "./auth"
import type { LoginForm, AuthorizeForm, AccessTokenResponse, TokenResponse, JsonWebTokenPayload } from "./auth"
import { getUserInfo, patchUserInfo, patchUserPassword } from "./user"
import type { User, UserPasswordUpdateForm, UserPartialUpdateForm } from "./user"
export { preloadAuthorization } from "./fetch"

export const auth = {login, register, authorize, logout}

export const user = {getUserInfo, patchUserInfo, patchUserPassword}

export type {
    LoginForm, AuthorizeForm, AccessTokenResponse, TokenResponse, JsonWebTokenPayload,
    User, UserPartialUpdateForm, UserPasswordUpdateForm
}
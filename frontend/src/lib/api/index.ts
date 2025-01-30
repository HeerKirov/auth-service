import { login, authorize, register, type LoginForm, type AuthorizeForm, type AccessTokenResponse, type TokenResponse } from "./auth"
import { getUserInfo, patchUserInfo, patchUserPassword, type User, type UserPasswordUpdateForm, type UserPartialUpdateForm } from "./user"
export { preloadAuthorization } from "./fetch"

export const auth = {login, register, authorize}

export const user = {getUserInfo, patchUserInfo, patchUserPassword}

export type {
    LoginForm, AuthorizeForm, AccessTokenResponse, TokenResponse,
    User, UserPartialUpdateForm, UserPasswordUpdateForm
}
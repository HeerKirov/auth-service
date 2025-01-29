import { login, authorize, type LoginForm, type AuthorizeForm, type AccessTokenResponse, type TokenResponse } from "./auth"
import { getUserInfo, patchUserInfo, patchUserPassword, type User, type UserPasswordUpdateForm, type UserPartialUpdateForm } from "./user"

export const auth = {login, authorize}

export const user = {getUserInfo, patchUserInfo, patchUserPassword}

export type {
    LoginForm, AuthorizeForm, AccessTokenResponse, TokenResponse,
    User, UserPartialUpdateForm, UserPasswordUpdateForm
}
import { login, authorize, type LoginForm, type AuthorizeForm, type AccessTokenResponse, type TokenResponse } from "./auth"
import { getUserInfo, type User } from "./user"

export const auth = {login, authorize}

export const user = {getUserInfo}

export type {
    LoginForm, AuthorizeForm, AccessTokenResponse, TokenResponse,
    User
}
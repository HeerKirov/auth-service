import { fetchRequest } from "./fetch"
import { User } from "./user"

export const login = (form: LoginForm) => fetchRequest<TokenResponse, "INVALID_USERNAME_OR_PASSWORD">("/login", {method: "POST", authorization: false, body: JSON.stringify(form)})

export const logout = () => fetchRequest<undefined>("/token?grantType=logout", {method: "POST"})

export const register = (form: RegisterForm) => fetchRequest<TokenResponse, "ALREADY_EXISTS">("/register", {method: "POST", authorization: false, body: JSON.stringify(form)})

export const authorize = (form: AuthorizeForm) => fetchRequest<AuthorizeResponse, "NOT_FOUND" | "DISABLED_USER" | "DISABLED_APP" | "INVALID_REDIRECT_URI">("/authorize", {method: "POST", body: JSON.stringify(form)})

export interface LoginForm {
    username: string
    password: string
}

export interface RegisterForm {
    username: string
    displayName: string
    password: string
    avatar?: string | null
}

export interface AuthorizeForm {
    appId: string
    redirectURI: string
}

export interface TokenResponse {
    accessToken: string
    user: User
}

export interface AccessTokenResponse {
    accessToken: string
}

export interface AuthorizeResponse {
    authorizationCode: string
}

export interface JsonWebTokenPayload {
    username: string
    appId: string
    permissions: {name: string, args: Record<string, unknown>}[]
    tokenCreateTime: number
    tokenExpireTime: number
}
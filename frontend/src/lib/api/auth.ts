import { fetchRequest } from "./fetch"
import { User } from "./user"


export const login = (form: LoginForm) => fetchRequest<TokenResponse>("/login", {method: "POST", authorization: false, body: JSON.stringify(form)})

export const authorize = (form: AuthorizeForm) => fetchRequest<TokenResponse>("/authorize", {method: "POST", body: JSON.stringify(form)})

export interface LoginForm {
    username: string
    password: string
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

export interface JsonWebTokenPayload {
    username: string
    appId: string
    permissions: []
    tokenCreateTime: number
    tokenExpireTime: number
}
import { z } from "zod"
import { User } from "@/schema/user"
import { App } from "@/schema/app"

export const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
})

export const authorizeSchema = z.object({
    appId: z.string(),
    redirectURI: z.string().url(),
})

export const authorizeVerifySchema = z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    code: z.string()
})

export const refreshTokenSchema = z.object({
    refreshToken: z.string()
})

export interface State {
    username: string
    appId: string
    getUser(): Promise<User>
    getApp(): Promise<App>
    getPermissions(): Promise<Permission[]>
}

export interface JsonWebTokenPayload {
    sub: string
    iss: string
    aud: string
    jti: string

    username: string
    name: string
    permissions: Permission[]
}

export interface Permission {
    name: string
    args: Record<string, unknown>
}
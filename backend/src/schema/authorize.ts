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
    appId: z.string(),
    appSecret: z.string(),
    authorizationCode: z.string()
})

export interface State {
    username: string
    appId: string
    getUser(): Promise<User>
    getApp(): Promise<App>
    getPermissions(): Promise<string[]>
}

export interface JsonWebTokenPayload {
    username: string
    appId: string
    permissions: string[]
    tokenCreateTime: number
    tokenExpireTime: number
}
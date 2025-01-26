import { z } from "zod"

export const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
})

export interface StateUser {
    username: string
    displayName: string
    appId: string
}

export interface JsonWebTokenPayload extends StateUser {
    tokenCreateTime: number
    tokenExpireTime: number
}
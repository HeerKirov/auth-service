import { z } from "zod";

export const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
})

export interface JsonWebTokenPayload {
    username: string
    displayName: string
    appId: string
    createTime: number
    expireTime: number
}
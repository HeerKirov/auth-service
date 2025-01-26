import { z } from "zod"

export const userCreateSchema = z.object({
    username: z.string(),
    password: z.string(),
    displayName: z.string(),
    avatar: z.string().nullable().optional(),
})

export const userSchema = z.object({
    username: z.string(),
    displayName: z.string(),
    avatar: z.string().nullable(),
    enabled: z.boolean(),
    createTime: z.date(),
    lastRefreshTime: z.date().nullable(),
})

export interface User {
    id: number
    username: string
    password: string
    displayName: string
    avatar: string | null
    enabled: boolean
    deleted: boolean
    createTime: Date
    lastRefreshTime: Date | null
}

export type UserCreateSchema = z.infer<typeof userCreateSchema>

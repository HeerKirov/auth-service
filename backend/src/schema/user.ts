import { z } from "zod"

export const userCreateSchema = z.object({
    username: z.string().nonempty().max(128),
    password: z.string().nonempty().max(64),
    displayName: z.string().max(128),
    avatar: z.string().nullable().optional(),
})

export const userPatchSchema = z.object({
    displayName: z.string().max(128).optional(),
    avatar: z.string().nullable().optional(),
})

export const userInAppPatchSchema = z.object({
    displayName: z.string().max(128).optional(),
    avatar: z.string().nullable().optional(),
    fields: z.record(z.string(), z.any()).optional()
})

export const userChangePasswordSchema = z.object({
    oldPassword: z.string().max(64),
    password: z.string().max(64)
})

export const userAdminChangePasswordSchema = z.object({
    password: z.string().max(64)
})

export const userAdminPatchSchema = z.object({
    displayName: z.string().max(128).optional(),
    enabled: z.boolean().optional(),
    avatar: z.string().nullable().optional(),
})

export const userSchema = z.object({
    uuid: z.string().max(24),
    username: z.string(),
    displayName: z.string(),
    avatar: z.string().nullable(),
    enabled: z.boolean(),
    createTime: z.date(),
    lastRefreshTime: z.date().nullable(),
}).transform(({ uuid, ...e }) => ({...e, id: uuid}))

export interface User {
    id: number
    uuid: string
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

export type UserUpdateSchema = z.infer<typeof userAdminPatchSchema> & Partial<z.infer<typeof userAdminChangePasswordSchema>>

export const userFields = ["id", "uuid", "username", "password", "displayName", "avatar", "enabled", "deleted", "createTime", "lastRefreshTime"] as const
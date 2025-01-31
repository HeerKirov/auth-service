import { z } from "zod"

export const appAdminCreateSchema = z.object({
    appId: z.string().max(128),
    appName: z.string().max(128),
    avatar: z.string().nullable().optional(),
    enabled: z.boolean().default(true),
    domains: z.array(z.string())
})

export const appAdminPatchSchema = z.object({
    appName: z.string().max(128).optional(),
    avatar: z.string().nullable().optional(),
    enabled: z.boolean().optional(),
    domains: z.array(z.string()).optional(),
})

export const appSchema = z.object({
    appId: z.string(),
    appName: z.string(),
    avatar: z.string().nullable(),
    enabled: z.boolean(),
    domains: z.array(z.string()),
    createTime: z.date()
})

export const appSecretSchema = z.object({
    appSecret: z.string()
})

export interface App {
    id: number
    appId: string
    appName: string
    appSecret: string
    avatar: string | null
    domains: string[]
    enabled: boolean
    createTime: Date
}

export type AppCreateSchema = z.infer<typeof appAdminCreateSchema>

export type AppUpdateSchema = z.infer<typeof appAdminPatchSchema> & Partial<z.infer<typeof appSecretSchema>>
import { z } from "zod"

export const appCreateSchema = z.object({
    appId: z.string(),
    appName: z.string(),
    appSecret: z.string(),
    avatar: z.string().nullable().optional(),
    domains: z.array(z.string())
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

export type AppCreateSchema = z.infer<typeof appCreateSchema>
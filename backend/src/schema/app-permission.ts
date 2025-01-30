import { z } from "zod"

const argumentDefinitionSchema = z.object({
    name: z.string(),
    type: z.enum(["string", "number", "boolean"]),
    optional: z.boolean(),
    comment: z.string().nullable()
})

export const permissionCreateSchema = z.object({
    name: z.string(),
    displayName: z.string(),
    arguments: z.array(argumentDefinitionSchema)
})

export const permissionUpdateSchema = z.object({
    name: z.string().optional(),
    displayName: z.string().optional(),
    arguments: z.array(argumentDefinitionSchema).optional()
})

export const permissionSchema = z.object({
    name: z.string(),
    displayName: z.string(),
    arguments: z.array(argumentDefinitionSchema),
    createTime: z.date()
})

export interface AppPermission {
    id: number
    appId: number
    name: string
    displayName: string
    arguments: ArgumentDefinition[]
    createTime: Date
}

export interface ArgumentDefinition {
    name: string
    type: "string" | "number" | "boolean"
    optional: boolean
    comment: string | null
}

export type PermissionCreateSchema = z.infer<typeof permissionCreateSchema>

export type PermissionUpdateSchema = z.infer<typeof permissionUpdateSchema>
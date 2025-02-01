import { z } from "zod"
import { userSchema } from "@/schema/user"
import { appSchema } from "@/schema/app"

export const userAppRelationSchema = z.object({
    fields: z.record(z.string(), z.any()),
    createTime: z.date(),
    lastRefreshTime: z.date().nullable()
})

export const appUserPermissionSchema = z.array(z.object({
    name: z.string(),
    args: z.record(z.string(), z.any())
}))

export const adminAppUserSchema = z.object({
    user: userSchema,
    userAppRelation: userAppRelationSchema,
    userAppPermissions: appUserPermissionSchema.optional()
}).transform(({ user, userAppRelation, userAppPermissions }) => ({
    ...user,
    userAppRelation,
    userAppPermissions
}))

export const myAppSchema = z.object({
    app: appSchema,
    userAppRelation: userAppRelationSchema,
    userAppPermissions: appUserPermissionSchema.optional()
}).transform(({ app, userAppRelation, userAppPermissions }) => ({
    ...app,
    userAppRelation,
    userAppPermissions
}))

export interface UserAppRelation {
    id: number
    appId: number
    userId: number
    fields: Record<string, any>
    createTime: Date
    lastRefreshTime: Date | null
}

export interface UserAppPermission {
    id: number
    appId: number
    permissionId: number
    userId: number
    arguments: Record<string, any>
    createTime: Date
}

export const userAppRelationFields = ["id", "appId", "userId", "fields", "createTime", "lastRefreshTime"] as const

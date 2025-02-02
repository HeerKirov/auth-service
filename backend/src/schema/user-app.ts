import { z } from "zod"
import { userSchema } from "@/schema/user"
import { appSchema } from "@/schema/app"
import { permissionSchema } from "@/schema/app-permission"

export const userAppRelationSchema = z.object({
    fields: z.record(z.string(), z.any()),
    createTime: z.date(),
    lastRefreshTime: z.date().nullable()
})

export const permissionArgumentsSchema = z.array(z.object({
    name: z.string(),
    args: z.record(z.string(), z.any())
}))

const userAppPermissionMiddle = z.object({
    appPermission: permissionSchema,
    userAppPermission: z.object({
        arguments: z.record(z.string(), z.any()),
        createTime: z.date()
    })
})

export const userAppPermissionSchema = userAppPermissionMiddle.transform(({ appPermission, userAppPermission }) => ({
    name: appPermission.name,
    displayName: appPermission.displayName,
    argumentDefinitions: appPermission.arguments,
    args: userAppPermission.arguments
}))

export const userAppPermissionSchemaForToken = userAppPermissionMiddle.transform(({ appPermission, userAppPermission }) => ({
    name: appPermission.name,
    args: userAppPermission.arguments
}))

export const adminUserInAppSchema = z.object({
    user: userSchema,
    userAppRelation: userAppRelationSchema,
    userAppPermissions: z.array(userAppPermissionSchema).optional()
}).transform(({ user, userAppRelation, userAppPermissions }) => ({
    ...user,
    userAppRelation,
    userAppPermissions
}))

export const myAppSchema = z.object({
    app: appSchema,
    userAppRelation: userAppRelationSchema,
    userAppPermissions: z.array(userAppPermissionSchema).optional()
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

export const userAppPermissionFields = ["id", "appId", "permissionId", "userId", "arguments", "createTime"] as const
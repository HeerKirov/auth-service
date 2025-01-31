import { UserAppPermission } from "@/schema/user-app"
import { db } from "@/utils/db"

export async function selectUserAppPermissions(userId: number, appId: number): Promise<{name: string, args: Record<string, unknown>}[]> {
    return db.from("user_app_permission")
        .select("user_app_permission.arguments as args", "app_permission.name AS name")
        .innerJoin("app_permission", "user_app_permission.permissionId", "app_permission.id")
        .where({"user_app_permission.appId": appId, "user_app_permission.userId": userId})
        .orderBy("app_permission.createTime", "ASC")
}

export async function upsertUserAppPermission(userId: number, appId: number, permissionId: number, args: Record<string, unknown>): Promise<UserAppPermission> {
    const exists = await db.from<UserAppPermission>("user_app_permission").where({userId, appId, permissionId}).first()
    if(exists === undefined) {
        const createTime = new Date()
        const [{ id }] = await db.from<UserAppPermission>("user_app_permission").insert({
            appId, userId, permissionId, arguments: JSON.stringify(args) as any, createTime
        }).returning(["id"])

        return {id, appId, userId, permissionId, arguments: args, createTime}
    }else{
        await db.from<UserAppPermission>("user_app_permission").where({id: exists.id}).update({arguments: JSON.stringify(args) as any})

        return {...exists, arguments: args}
    }
}

export async function dropUserAppPermission(userId: number, appId: number, permissionId: number): Promise<number> {
    return db.from<UserAppPermission>("user_app_permission").where({userId, appId, permissionId}).delete()
}
import { UserAppPermission, userAppPermissionFields } from "@/schema/user-app"
import { AppPermission, appPermissionFields } from "@/schema/app-permission"
import { db, constructJoinNest, projectJoinNest, Knex } from "@/utils/db"

export async function selectUserAppPermissions(userId: number, appId: number): Promise<{appPermission: AppPermission, userAppPermission: UserAppPermission}[]> {
    const result = await db.from<UserAppPermission>("user_app_permission")
        .innerJoin<AppPermission>("app_permission", "user_app_permission.permissionId", "app_permission.id")
        .select(
            ...projectJoinNest("app_permission", appPermissionFields, "appPermission"),
            ...projectJoinNest("user_app_permission", userAppPermissionFields, "userAppPermission")
        )
        .where("user_app_permission.appId", appId)
        .where("user_app_permission.userId", userId)
        .orderBy("app_permission.createTime", "ASC")

    return result.map(constructJoinNest)
}

export async function upsertUserAppPermission(userId: number, appId: number, permissionId: number, args: Record<string, unknown>, trx?: Knex.Transaction): Promise<UserAppPermission> {
    const exists = await (trx ?? db).from<UserAppPermission>("user_app_permission").where({userId, appId, permissionId}).first()
    if(exists === undefined) {
        return await insertUserAppPermission(userId, appId, permissionId, args)
    }else{
        await (trx ?? db).from<UserAppPermission>("user_app_permission").where({id: exists.id}).update({arguments: JSON.stringify(args) as any})

        return {...exists, arguments: args}
    }
}

export async function insertUserAppPermission(userId: number, appId: number, permissionId: number, args: Record<string, unknown>): Promise<UserAppPermission> {
    const createTime = new Date()
    const [{ id }] = await db.from<UserAppPermission>("user_app_permission").insert({
        appId, userId, permissionId, arguments: JSON.stringify(args) as any, createTime
    }).returning(["id"])

    return {id, appId, userId, permissionId, arguments: args, createTime}
}

export async function dropUserAppPermissions(ids: number[]): Promise<number> {
    return db.from<UserAppPermission>("user_app_permission").where("id", "in", ids).delete()
}
import { AppPermission, PermissionCreateSchema, PermissionUpdateSchema } from "@/schema/app-permission"
import { UserAppPermission } from "@/schema/user-app"
import { OffsetAndLimitFilter } from "@/schema/filters"
import { ListResult } from "@/schema/general"
import { db } from "@/utils/db"

export async function selectAppPermissions(appId: number, filter: OffsetAndLimitFilter): Promise<ListResult<AppPermission>> {
    const builder = db.from<AppPermission>("app_permission").where({appId}).orderBy("createTime", "ASC")
    if(filter.limit) builder.limit(filter.limit)
    if(filter.offset) builder.offset(filter.offset)
    const data = await builder

    const cBuilder = db.from<AppPermission>("app_permission").where({appId})
    const [{ count }] = await cBuilder.count()
    const total = parseInt(<string>count)

    return {total, data}
}

export async function createAppPermission(appId: number, p: PermissionCreateSchema): Promise<AppPermission> {
    const exists = await db.from<AppPermission>("app_permission").where({appId, name: p.name}).first()
    if(exists) {
        throw new Error(`Permission '${p.name}' already exists`)
    }

    const createTime = new Date()

    const [{ id }] = await db.from<AppPermission>("app_permission").insert({
        appId, ...p, createTime, arguments: JSON.stringify(p.arguments) as any
    }).returning(["id"])

    return {id, appId, ...p, createTime}
}

export async function upsertAppPermission(appId: number, p: PermissionCreateSchema): Promise<AppPermission> {
    const exists = await db.from<AppPermission>("app_permission").where({appId, name: p.name}).first()
    if(exists) {
        await db.from<AppPermission>("app_permission").where({id: exists.id}).update({displayName: p.displayName, arguments: JSON.stringify(p.arguments) as any}).returning(["id"])

        return {...exists, displayName: p.displayName, arguments: p.arguments}
    }else{
        const createTime = new Date()

        const [{ id }] = await db.from<AppPermission>("app_permission").insert({
            appId, ...p, createTime, arguments: JSON.stringify(p.arguments) as any
        }).returning(["id"])

        return {id, appId, ...p, createTime}
    }
}

export async function getAppPermission(id: number): Promise<AppPermission | null> {
    return (await db.first().from<AppPermission>("app_permission").where({id})) ?? null
}

export async function getAppPermissionByName(appId: number, name: string): Promise<AppPermission | null> {
    return (await db.first().from<AppPermission>("app_permission").where({appId, name})) ?? null
}

export async function setAppPermission(id: number, p: PermissionUpdateSchema): Promise<void> {
    await db.from<AppPermission>("app_permission").where({id}).update({...p, arguments: p.arguments !== undefined ? JSON.stringify(p.arguments) as any : undefined})
}

export async function dropAppPermission(id: number): Promise<number> {
    const r = await db.from<AppPermission>("app_permission").where({id}).delete()
    if(r > 0) {
        await db.from<UserAppPermission>("user_app_permission").where({permissionId: id}).delete()
    }
    return r
}
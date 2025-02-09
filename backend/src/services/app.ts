import { randomBytes } from "crypto"
import { AppPermission } from "@/schema/app-permission"
import { RefreshToken } from "@/schema/token"
import { App, AppCreateSchema, AppUpdateSchema } from "@/schema/app"
import { UserAppPermission, UserAppRelation } from "@/schema/user-app"
import { AppFilter } from "@/schema/filters"
import { ListResult } from "@/schema/general"
import { db, Knex } from "@/utils/db"
import { ErrorCode, ServerError } from "@/utils/error"
import config from "@/config"

export async function selectApps(filter: AppFilter): Promise<ListResult<App>> {
    const builder = db.from<App>("app").orderBy("createTime", "desc")
    if(filter.search) builder.where("appName", "ilike", `%${filter.search}%`).orWhere("appId", "ilike", `%${filter.search}%`)
    if(filter.enabled) builder.where("enabled", filter.enabled)
    if(filter.limit) builder.limit(filter.limit)
    if(filter.offset) builder.offset(filter.offset)
    const data = await builder

    const cBuilder = db.from<App>("app")
    if(filter.search) cBuilder.where("appName", "ilike", `%${filter.search}%`).orWhere("appId", "ilike", `%${filter.search}%`)
    if(filter.enabled) cBuilder.where("enabled", filter.enabled)
    const [{ count }] = await cBuilder.count()
    const total = parseInt(<string>count)

    return {total, data}
}

export async function createApp(app: AppCreateSchema, trx?: Knex.Transaction): Promise<App> {
    const exists = await (trx ?? db)("app").where({"appId": app.appId}).first()
    if (exists) {
        throw new ServerError(400, ErrorCode.AlreadyExists, "App already exists")
    }

    const appSecret = app.appId !== config.app.appId ? randomBytes(32).toString("base64") : ""
    const createTime = new Date()

    const [{ id }] = await (trx ?? db).from<App>("app").insert({
        "appId": app.appId,
        "appName": app.appName,
        "appSecret": appSecret,
        "description": app.description ?? "",
        "url": app.url ?? "",
        "avatar": app.avatar ?? null,
        "domains": JSON.stringify(app.domains) as any,
        "enabled": app.enabled,
        "createTime": createTime,
    }).returning("id")

    return {id, appSecret, description: app.description ?? "", url: app.url ?? "", avatar: app.avatar ?? null, ...app, createTime}
}

export async function getApp(appId: string): Promise<App | null> {
    return (await db.first().from<App>("app").where({appId})) ?? null
}

export async function getAppById(id: number): Promise<App | null> {
    return (await db.first().from<App>("app").where({id})) ?? null
}

export async function setApp(id: number, app: AppUpdateSchema): Promise<void> {
    await db.from<App>("app").where({id}).update({...app, domains: app.domains ? JSON.stringify(app.domains) as any : undefined})
}

export async function regenerateAppSecret(id: number): Promise<void> {
    const appSecret = randomBytes(32).toString("base64")
    await db.from<App>("app").where({id}).update({appSecret})
}

export async function dropApp(id: number): Promise<number> {
    const r = await db.from<App>("app").where({id}).delete()
    if(r > 0) {
        await db.from<AppPermission>("app_permission").where({appId: id}).delete()
        await db.from<UserAppPermission>("user_app_permission").where({appId: id}).delete()
        await db.from<UserAppRelation>("user_app_relation").where({appId: id}).delete()
        await db.from<RefreshToken>("refresh_token").where({appId: id}).delete()
    }
    return r
}


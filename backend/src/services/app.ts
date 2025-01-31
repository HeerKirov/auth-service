import { randomBytes } from "crypto"
import { AppPermission } from "@/schema/app-permission"
import { RefreshToken } from "@/schema/token"
import { App, AppCreateSchema, AppUpdateSchema } from "@/schema/app"
import { UserAppPermission, UserAppRelation } from "@/schema/user-app"
import { AppFilter } from "@/schema/filters"
import { db } from "@/utils/db"
import config from "@/config"

export async function selectApps(filter: AppFilter): Promise<App[]> {
    const builder = db.from<App>("app").orderBy("createTime", "desc")
    if(filter.search) builder.where("appName", "ilike", `%${filter.search}%`).orWhere("appId", "ilike", `%${filter.search}%`)
    if(filter.enabled) builder.where("enabled", filter.enabled)
    if(filter.limit) builder.limit(filter.limit)
    if(filter.offset) builder.offset(filter.offset)
    return builder
}

export async function countApps(filter: AppFilter): Promise<number> {
    const builder = db.from<App>("app")
    if(filter.search) builder.where("appName", "ilike", `%${filter.search}%`).orWhere("appId", "ilike", `%${filter.search}%`)
    if(filter.enabled) builder.where("enabled", filter.enabled)
    const [{ count }] = await builder.count()
    return parseInt(<string>count)
}

export async function createApp(app: AppCreateSchema): Promise<App> {
    const exists = await db("app").where({"appId": app.appId}).first()
    if (exists) {
        throw new Error("App already exists")
    }

    const appSecret = app.appId !== config.app.appId ? randomBytes(32).toString("base64") : ""
    const createTime = new Date()

    const [{ id }] = await db.from<App>("app").insert({
        "appId": app.appId,
        "appName": app.appName,
        "appSecret": appSecret,
        "avatar": app.avatar ?? null,
        "domains": JSON.stringify(app.domains) as any,
        "enabled": app.enabled,
        "createTime": createTime,
    }).returning("id")

    return {id, appSecret, avatar: app.avatar ?? null, ...app, createTime}
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


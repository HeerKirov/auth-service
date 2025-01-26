import { App, AppCreateSchema } from "@/schema/app"
import { db } from "@/utils/db"
import config from "@/config"

export async function createApp(app: AppCreateSchema) {
    const exists = await db("app").where({"appId": app.appId}).first()
    if (exists) {
        throw new Error("App already exists")
    }

    await db.from<App>("app").insert({
        "appId": app.appId,
        "appName": app.appName,
        "appSecret": app.appSecret,
        "avatar": app.avatar ?? null,
        "domains": app.domains,
        "enabled": true,
        "createTime": new Date(),
    })
}

export async function getApp(appId: string): Promise<App | null> {
    return (await db.first().from<App>("app").where({"appId": appId})) ?? null
}

export async function getAppById(id: number): Promise<App | null> {
    return (await db.first().from<App>("app").where({"id": id})) ?? null
}

export async function setupDefaultApp() {
    const app = await getApp("auth-service")
    if(app === null) {
        await createApp({
            appId: config.default.appId,
            appName: config.default.appName,
            appSecret: "",
            avatar: null,
            domains: []
        })
    }
}
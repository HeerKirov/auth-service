import config from "@/config"
import { createApp, getApp } from "@/services/app"
import { createUser, getUser } from "@/services/user"
import { upsertAppPermission } from "@/services/app-permission"
import { upsertUserAppPermission } from "@/services/user-permission"

export async function setupApp() {
    let user = await getUser(config.app.admin.username)
    if(user === null) {
        user = await createUser({
            username: config.app.admin.username,
            password: config.app.admin.password,
            displayName: config.app.admin.displayName,
            avatar: null
        })
        console.log("Admin user created.")
    }
    let app = await getApp(config.app.appId)
    if(app === null) {
        app = await createApp({
            appId: config.app.appId,
            appName: config.app.appName,
            avatar: null,
            enabled: true,
            domains: []
        })

        console.log("Auth-Service app created.")

        const pmsAdmin = await upsertAppPermission(app.id, {name: "ADMIN", displayName: "系统管理员", arguments: []})
        await upsertAppPermission(app.id, {name: "APP_ADMIN", displayName: "应用管理员", arguments: [{name: "appId", type: "string", optional: false, comment: "被授权应用的ID"}]})

        await upsertUserAppPermission(user!.id, app.id, pmsAdmin.id, {})

        console.log("Auth-Service app permission granted.")
    }
}

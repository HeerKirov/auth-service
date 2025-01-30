import { Context } from "koa"
import { appFilter } from "@/schema/filters"
import { appAdminCreateSchema, appAdminPatchSchema, appSchema, appSecretSchema } from "@/schema/app"
import { countApps, createApp, getApp, getAppById, regenerateAppSecret, selectApps, setApp, setAppDeleted } from "@/services/app"

export async function listApps(ctx: Context) {
    const filter = appFilter.parse(ctx.request.query)
    const result = await selectApps(filter)
    const total = await countApps(filter)

    ctx.response.body = {
        total,
        data: result.map(a => appSchema.parse(a))
    }
}

export async function postApp(ctx: Context) {
    const form = appAdminCreateSchema.parse(ctx.request.body)

    const app = await createApp(form)

    ctx.response.body = appSchema.parse(app)
    ctx.response.status = 201
}

export async function retrieveApp(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        ctx.response.body = {message: "App Not Found"}
        ctx.status = 404
        return
    }

    ctx.response.body = appSchema.parse(app)
}

export async function patchApp(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        ctx.response.body = {message: "App Not Found"}
        ctx.status = 404
        return
    }

    const form = appAdminPatchSchema.parse(ctx.request.body)

    await setApp(app.id, form)

    ctx.response.body = appSchema.parse(await getAppById(app.id))
}

export async function deleteApp(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        ctx.response.body = {message: "App Not Found"}
        ctx.status = 404
        return
    }

    await setAppDeleted(app.id)

    ctx.response.body = {success: true}
    ctx.response.status = 204
}

export async function retrieveAppSecret(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        ctx.response.body = {message: "App Not Found"}
        ctx.status = 404
        return
    }

    ctx.response.body = appSecretSchema.parse(app)
}

export async function patchAppSecret(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        ctx.response.body = {message: "App Not Found"}
        ctx.status = 404
        return
    }

    await regenerateAppSecret(app.id)

    ctx.response.body = appSecretSchema.parse(await getAppById(app.id))
}
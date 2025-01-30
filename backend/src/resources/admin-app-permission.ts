import { Context } from "koa"
import { offsetAndLimitFilter } from "@/schema/filters"
import { AppPermission, permissionCreateSchema, permissionSchema, permissionUpdateSchema } from "@/schema/app-permission"
import { countAppPermissions, createAppPermission, dropAppPermission, getAppPermission, selectAppPermissions, setAppPermission } from "@/services/app-permission"
import { getApp } from "@/services/app"

export async function listAppPermissions(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        ctx.response.body = {message: "App Not Found"}
        ctx.status = 404
        return
    }

    const filter = offsetAndLimitFilter.parse(ctx.request.query)
    const result = await selectAppPermissions(app.id, filter)
    const total = await countAppPermissions(app.id)

    ctx.response.body = {
        total,
        data: result.map(a => permissionSchema.parse(a))
    }
}

export async function postAppPermission(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        ctx.response.body = {message: "App Not Found"}
        ctx.status = 404
        return
    }

    const form = permissionCreateSchema.parse(ctx.request.body)

    const appPermission = await createAppPermission(app.id, form)

    ctx.response.body = permissionSchema.parse(appPermission)
    ctx.response.status = 201
}

export async function patchAppPermission(ctx: Context) {
    const appPermission = await getDetail(ctx)
    if(!appPermission) return

    const form = permissionUpdateSchema.parse(ctx.request.body)

    await setAppPermission(appPermission.id, form)

    ctx.response.body = permissionSchema.parse(await getAppPermission(appPermission.id))
}

export async function deleteAppPermission(ctx: Context) {
    const appPermission = await getDetail(ctx)
    if(!appPermission) return

    await dropAppPermission(appPermission.id)

    ctx.response.body = {success: true}
    ctx.response.status = 204
}

async function getDetail(ctx: Context): Promise<AppPermission | null> {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        ctx.response.body = {message: "App Not Found"}
        ctx.status = 404
        return null
    }
    const appPermission = await getAppPermission(ctx.params.id)
    if(appPermission === null || appPermission.appId !== app.id) {
        ctx.response.body = {message: "AppPermission Not Found"}
        ctx.status = 404
        return null
    }
    return appPermission
}
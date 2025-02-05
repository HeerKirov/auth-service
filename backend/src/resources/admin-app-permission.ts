import { Context } from "koa"
import { offsetAndLimitFilter } from "@/schema/filters"
import { AppPermission, permissionCreateSchema, permissionSchema, permissionUpdateSchema } from "@/schema/app-permission"
import { createAppPermission, dropAppPermission, getAppPermission, selectAppPermissions, setAppPermission } from "@/services/app-permission"
import { getApp } from "@/services/app"
import { ErrorCode, ServerError } from "@/utils/error"

export async function listAppPermissions(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        throw new ServerError(404, ErrorCode.NotFound, "App not found")
    }

    const filter = offsetAndLimitFilter.parse(ctx.request.query)
    const { total, data } = await selectAppPermissions(app.id, filter)

    ctx.response.body = {
        total,
        data: data.map(a => permissionSchema.parse(a))
    }
}

export async function postAppPermission(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        throw new ServerError(404, ErrorCode.NotFound, "App not found")
    }

    const form = permissionCreateSchema.parse(ctx.request.body)

    const appPermission = await createAppPermission(app.id, form)

    ctx.response.body = permissionSchema.parse(appPermission)
    ctx.response.status = 201
}

export async function retrieveAppPermission(ctx: Context) {
    const appPermission = await getDetail(ctx)

    ctx.response.body = permissionSchema.parse(appPermission)
}

export async function patchAppPermission(ctx: Context) {
    const appPermission = await getDetail(ctx)

    const form = permissionUpdateSchema.parse(ctx.request.body)

    //TODO 需要校验参数列表是否唯一

    await setAppPermission(appPermission.id, form)

    ctx.response.body = permissionSchema.parse(await getAppPermission(appPermission.id))
}

export async function deleteAppPermission(ctx: Context) {
    const appPermission = await getDetail(ctx)

    //TODO 阻止删除根App的根权限

    await dropAppPermission(appPermission.id)

    ctx.response.body = {success: true}
    ctx.response.status = 204
}

async function getDetail(ctx: Context): Promise<AppPermission> {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        throw new ServerError(404, ErrorCode.NotFound, "App not found")
    }
    const appPermission = await getAppPermission(ctx.params.id)
    if(appPermission === null || appPermission.appId !== app.id) {
        throw new ServerError(404, ErrorCode.NotFound, "AppPermission not found")
    }
    return appPermission
}
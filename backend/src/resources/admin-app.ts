import fs from "fs"
import { Context } from "koa"
import { appFilter } from "@/schema/filters"
import { appAdminCreateSchema, appAdminPatchSchema, appSchema, appSecretSchema } from "@/schema/app"
import { createApp, getApp, getAppById, regenerateAppSecret, selectApps, setApp, dropApp } from "@/services/app"
import { deleteRefreshTokenByApp } from "@/services/token"
import { ErrorCode, ServerError } from "@/utils/error"
import { deleteFile, existFile, uploadFile } from "@/utils/oss"
import config from "@/config"

export async function listApps(ctx: Context) {
    const filter = appFilter.parse(ctx.request.query)
    const { total, data } = await selectApps(filter)

    ctx.response.body = {
        total,
        data: data.map(a => appSchema.parse(a))
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
        throw new ServerError(404, ErrorCode.NotFound, "App not found")
    }

    ctx.response.body = appSchema.parse(app)
}

export async function patchApp(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        throw new ServerError(404, ErrorCode.NotFound, "App not found")
    }

    const form = appAdminPatchSchema.parse(ctx.request.body)

    if(form.enabled === false && app.appId === config.app.appId) {
        throw new ServerError(403, ErrorCode.RootProtected, "Cannot alter Auth-Service app's enabled to FALSE.")
    }

    await setApp(app.id, form)

    ctx.response.body = appSchema.parse(await getAppById(app.id))
}

export async function deleteApp(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        throw new ServerError(404, ErrorCode.NotFound, "App not found")
    }else if(app.appId === config.app.appId) {
        throw new ServerError(403, ErrorCode.RootProtected, "Cannot delete Auth-Service app.")
    }

    await dropApp(app.id)

    ctx.response.body = {success: true}
    ctx.response.status = 204
}

export async function retrieveAppSecret(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        throw new ServerError(404, ErrorCode.NotFound, "App not found")
    }

    ctx.response.body = appSecretSchema.parse(app)
}

export async function patchAppSecret(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        throw new ServerError(404, ErrorCode.NotFound, "App not found")
    }

    await regenerateAppSecret(app.id)
    await deleteRefreshTokenByApp(app.id)

    ctx.response.body = appSecretSchema.parse(await getAppById(app.id))
}

export async function uploadAppAvatar(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        throw new ServerError(404, ErrorCode.NotFound, "App not found")
    }

    const file = ctx.request.files?.["file"]
    if(!file) {
        throw new ServerError(400, ErrorCode.InvalidParameter, "FormData 'file' is required.")
    }
    const f = file instanceof Array ? file[0] : file
    try {
        if(!f.mimetype || !f.mimetype.startsWith("image/")) {
            throw new ServerError(400, ErrorCode.InvalidParameter, "Only image file is supported.")
        }
        const ext = f.mimetype.substring("image/".length)

        const objectName = `${app.id}-${Date.now()}.${ext}`
        await uploadFile(`avatar/app/${objectName}`, f.filepath, {})
        await setApp(app.id, {avatar: objectName})

        if(app.avatar !== null && await existFile(`avatar/app/${objectName}`)) {
            await deleteFile(`avatar/app/${app.avatar}`)
        }

        ctx.response.body = {avatar: `avatar/app/${objectName}`}
    }finally {
        await fs.promises.rm(f.filepath)
    }
}

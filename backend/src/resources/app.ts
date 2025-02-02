import { Context } from "koa"
import { State } from "@/schema/authorize"
import { myAppSchema } from "@/schema/user-app"
import { appFilter } from "@/schema/filters"
import { getApp } from "@/services/app"
import { selectAppWithUserRelation } from "@/services/app-user"
import { getUserAppRelation } from "@/services/user-app"
import { selectUserAppPermissions } from "@/services/user-permission"
import { ErrorCode, ServerError } from "@/utils/error"


export async function listMyApps(ctx: Context) {
    const filter = appFilter.parse(ctx.request.query)

    const state: State = ctx.state
    const user = await state.getUser()

    const { total, data } = await selectAppWithUserRelation(user.id, filter)

    ctx.response.body = {
        total,
        data: data.map(a => myAppSchema.parse(a))
    }
}

export async function retrieveMyApp(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        throw new ServerError(404, ErrorCode.NotFound, "App not found")
    }

    const state: State = ctx.state
    const user = await state.getUser()

    const userAppRelation = await getUserAppRelation(user.id, app.id)
    if(userAppRelation === null) {
        throw new ServerError(404, ErrorCode.NotFound, "UserAppRelation not found")
    }

    const userAppPermissions = await selectUserAppPermissions(user.id, userAppRelation.appId)

    ctx.response.body = myAppSchema.parse({app, userAppRelation, userAppPermissions})
}
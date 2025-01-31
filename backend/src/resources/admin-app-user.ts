import { Context } from "koa"
import { isDeepStrictEqual } from 'util'
import { User } from "@/schema/user"
import { offsetAndLimitFilter } from "@/schema/filters"
import { adminAppUserSchema, appUserPermissionSchema, UserAppRelation } from "@/schema/user-app"
import { getApp } from "@/services/app"
import { getUser } from "@/services/user"
import { dropUserAppPermission, selectUserAppPermissions, upsertUserAppPermission } from "@/services/user-permission"
import { countUserWithAppRelation, getUserAppRelation, selectUserWithAppRelation } from "@/services/user-app"
import { getAppPermissionByName } from "@/services/app-permission"
import config from "@/config"

export async function listAppUsers(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        ctx.response.body = {message: "App Not Found"}
        ctx.status = 404
        return
    }

    const filter = offsetAndLimitFilter.parse(ctx.request.query)
    const result = await selectUserWithAppRelation(app.id, filter)
    const total = await countUserWithAppRelation(app.id)

    ctx.response.body = {
        total,
        data: result.map(a => adminAppUserSchema.parse(a))
    }
}

export async function retrieveAppUser(ctx: Context) {
    const [user, userAppRelation] = await getDetail(ctx)
    if(!user) return

    const permissions = await selectUserAppPermissions(user.id, userAppRelation.appId)

    ctx.response.body = adminAppUserSchema.parse({user, userAppRelation, userAppPermissions: permissions})
}

export async function putAppUserPermissions(ctx: Context) {
    const [user, userAppRelation] = await getDetail(ctx)
    if(!user) return

    const origin = await selectUserAppPermissions(user.id, userAppRelation.appId)
    const newPermissions = appUserPermissionSchema.parse(ctx.request.body)

    const upsert: [number, Record<string, unknown>][] = []
    const remove: number[] = []
    for(const form of newPermissions) {
        const permission = await getAppPermissionByName(userAppRelation.appId, form.name)
        if(permission === null) {
            ctx.response.status = 400
            ctx.response.body = {message: `Permission '${form.name}' not found`}
            return
        }
        for(const argument of permission.arguments) {
            const value = form.args[argument.name]
            if((value === null || value === undefined) && !argument.optional) {
                ctx.response.status = 400
                ctx.response.body = {message: `Permission '${form.name}': argument '${argument.name}' is required`}
                return
            }else if(typeof value !== argument.type) {
                ctx.response.status = 400
                ctx.response.body = {message: `Permission '${form.name}': argument '${argument.name}' requires ${argument.type} but actually ${typeof value}`}
                return
            }
        }
        const exist = origin.find(i => i.name === form.name)
        if(exist === undefined || !isDeepStrictEqual(exist.args, form.args)) {
            upsert.push([permission.id, form.args])
        }
    }
    for(const old of origin) {
        if(!newPermissions.some(j => j.name === old.name)) {
            const permission = await getAppPermissionByName(userAppRelation.appId, old.name)
            if(permission === null) {
                ctx.response.status = 500
                ctx.response.body = {message: `Permission '${old.name}' not found`}
                return
            }
            remove.push(permission.id)
        }
    }

    await Promise.all(upsert.map(([id, args]) => upsertUserAppPermission(user.id, userAppRelation.appId, id, args)))
    await Promise.all(remove.map(id => dropUserAppPermission(user.id, userAppRelation.appId, id)))

    ctx.response.body = adminAppUserSchema.parse({user, userAppRelation, userAppPermissions: newPermissions})
}


async function getDetail(ctx: Context): Promise<[User, UserAppRelation] | [null, null]> {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        ctx.response.body = {message: "App Not Found"}
        ctx.status = 404
        return [null, null]
    }
    const user = await getUser(ctx.params.username)
    if(user === null) {
        ctx.response.body = {message: "User Not Found"}
        ctx.status = 404
        return [null, null]
    }
    if(user.username === config.app.admin.username && app.appId === config.app.appId) {
        ctx.response.status = 403
        ctx.response.body = {message: "Cannot alter ADMIN user's permissions for Auth-Service self."}
        return [null, null]
    }
    const userAppRelation = await getUserAppRelation(user.id)
    if(userAppRelation === null || userAppRelation.appId !== app.id) {
        ctx.response.body = {message: "UserAppRelation Not Found"}
        ctx.status = 404
        return [null, null]
    }

    return [user, userAppRelation]
}
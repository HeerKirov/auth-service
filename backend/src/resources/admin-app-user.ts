import { Context } from "koa"
import { isDeepStrictEqual } from "util"
import { User } from "@/schema/user"
import { offsetAndLimitFilter } from "@/schema/filters"
import { adminUserInAppSchema, permissionArgumentsSchema, UserAppRelation } from "@/schema/user-app"
import { getApp } from "@/services/app"
import { getUser } from "@/services/user"
import { dropUserAppPermissions, insertUserAppPermission, selectUserAppPermissions, } from "@/services/user-permission"
import { getUserAppRelation, selectUserWithAppRelation } from "@/services/user-app"
import { getAppPermissionByName } from "@/services/app-permission"
import { ErrorCode, ServerError } from "@/utils/error"
import config from "@/config"

export async function listAppUsers(ctx: Context) {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        throw new ServerError(404, ErrorCode.NotFound, "App not found")
    }

    const filter = offsetAndLimitFilter.parse(ctx.request.query)
    const { total, data } = await selectUserWithAppRelation(app.id, filter)

    ctx.response.body = {
        total,
        data: data.map(a => adminUserInAppSchema.parse(a))
    }
}

export async function retrieveAppUser(ctx: Context) {
    const [user, userAppRelation] = await getDetail(ctx)

    const userAppPermissions = await selectUserAppPermissions(user.id, userAppRelation.appId)

    ctx.response.body = adminUserInAppSchema.parse({user, userAppRelation, userAppPermissions})
}

export async function putAppUserPermissions(ctx: Context) {
    const [user, userAppRelation] = await getDetail(ctx)

    const origin = await selectUserAppPermissions(user.id, userAppRelation.appId)
    const newPermissions = permissionArgumentsSchema.parse(ctx.request.body)

    const add: [number, Record<string, unknown>][] = []
    const remove: number[] = []
    for(const form of newPermissions) {
        //在表单中搜索当前不存在的权限项。存在的判定标准是permission name和args列表都一致。
        //这个判定标准意味着只会有增加和删除，不会有更新操作了。
        //使用这个判定标准可以比较好地处理权限本身可重复的问题。这样唯一标准是权限+参数列表不重复。
        if(!origin.some(j => j.appPermission.name === form.name && isDeepStrictEqual(j.userAppPermission.arguments, form.args))) {
            const permission = await getAppPermissionByName(userAppRelation.appId, form.name)
            if(permission === null) {
                ctx.response.status = 400
                ctx.response.body = {message: `Permission '${form.name}' not exist`}
                return
            }
            //进行参数校验
            for(const argument of permission.arguments) {
                const value = form.args[argument.name]
                if((value === null || value === undefined) && !argument.optional) {
                    ctx.response.status = 400
                    ctx.response.body = {message: `Permission '${form.name}': argument '${argument.name}' is required`}
                    return
                }else if(value !== null && value !== undefined && typeof value !== argument.type) {
                    ctx.response.status = 400
                    ctx.response.body = {message: `Permission '${form.name}': argument '${argument.name}' requires ${argument.type} but actually ${typeof value}`}
                    return
                }
            }
            add.push([permission.id, form.args])
        }
    }
    for(const old of origin) {
        //反向搜索当前列表在表单中不存在的权限项，移除这些项。
        if(!newPermissions.some(j => j.name === old.appPermission.name && isDeepStrictEqual(j.args, old.userAppPermission.arguments))) {
            remove.push(old.userAppPermission.id)
        }
    }

    if(remove.length > 0) await dropUserAppPermissions(remove)
    await Promise.all(add.map(([id, args]) => insertUserAppPermission(user.id, userAppRelation.appId, id, args)))

    const userAppPermissions = await selectUserAppPermissions(user.id, userAppRelation.appId)

    ctx.response.body = adminUserInAppSchema.parse({user, userAppRelation, userAppPermissions})
}


async function getDetail(ctx: Context): Promise<[User, UserAppRelation]> {
    const app = await getApp(ctx.params.appId)
    if(app === null) {
        throw new ServerError(404, ErrorCode.NotFound, "App not found")
    }
    const user = await getUser(ctx.params.username)
    if(user === null) {
        throw new ServerError(404, ErrorCode.NotFound, "User not found")
    }
    if(ctx.method !== "GET" && user.username === config.app.admin.username && app.appId === config.app.appId) {
        throw new ServerError(403, ErrorCode.RootProtected, "Cannot alter ADMIN user's permissions for Auth-Service self.")
    }
    const userAppRelation = await getUserAppRelation(user.id, app.id)
    if(userAppRelation === null) {
        throw new ServerError(404, ErrorCode.NotFound, "UserAppRelation not found")
    }

    return [user, userAppRelation]
}
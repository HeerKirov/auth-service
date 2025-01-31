import { Context, Next } from "koa"
import { State } from "@/schema/authorize"

export async function permission(ctx: Context, next: Next) {
    //访问任何/admin/users的API都要求ADMIN权限
    if(ctx.path.startsWith("/admin/users")) {
        const state: State = ctx.state
        const permissions = await state.getPermissions()
        if(!permissions.some(p => p.name === "ADMIN")) {
            ctx.status = 403
            ctx.response.body = {message: "Forbidden"}
            return
        }
    }

    //访问/admin/apps的API，一般要求ADMIN权限，不过对于/:appId的PATCH以及/:appId/sub，对应的APP_ADMIN也可以
    if(ctx.path.startsWith("/admin/apps")) {
        const state: State = ctx.state
        const permissions = await state.getPermissions()
        if(permissions.some(p => p.name === "ADMIN")) {
            //continue
        }else{
            const matcher = ctx.path.match(/^\/admin\/apps\/(?<appId>[^\/]+)(\/(?<sub>permissions|users))?/)
            if(!matcher) {
                ctx.status = 403
                ctx.response.body = {message: "Forbidden"}
                return
            }
            const appId = matcher.groups!["appId"]
            const sub = matcher.groups!["sub"]
            if(sub || (!sub && ctx.method === "PATCH" || ctx.method === "GET")) {
                if(permissions.some(p => p.name === "ADMIN" || (p.name === "APP_ADMIN" && p.args["appId"] === appId))) {
                    //continue
                }else{
                    ctx.status = 403
                    ctx.response.body = {message: "You are not APP_ADMIN of this app"}
                    return
                }
            }else{
                ctx.status = 403
                ctx.response.body = {message: "You are not Admin of this app"}
                return
            }
        }
    }

    return await next()
}